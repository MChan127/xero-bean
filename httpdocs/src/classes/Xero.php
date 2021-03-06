<?php
use XeroPHP\Application\PrivateApplication;
use XeroPHP\Remote\Exception\BadRequestException;

/**
 * 
 */
class Xero {
    private $config;

    protected $xero;

    protected $dataType;

    function __construct() {
        $pemFile = ROOT_DIR . 'private/xero/privatekey.pem';
        $privateKey = file_get_contents($pemFile);

        $config = [
            'oauth' => [
                'callback' => $_ENV['SERVER_HOST'] . 'xerocallback.php',
                'consumer_key' => $_ENV['CONSUMER_KEY'],
                'consumer_secret' => $_ENV['CONSUMER_SECRET'],
                'rsa_private_key' => $privateKey,
            ],
        ];

        $this->_xero = new PrivateApplication($config);
    }
    
    public function getData($refresh = null, $export = false) {
        $filters = null;

        // check if request has any filters 
        parse_str($_SERVER['QUERY_STRING'], $filters);
        unset($filters['type']);
        unset($filters['debug']);
        unset($filters['refresh']);
        unset($filters['download']);
        if (!empty($filters)) {
            $cacheKey = sprintf("%s_%s", str_replace('\\', '_', $this->dataType), preg_replace('/[^A-Za-z0-9\-]/', '_', $_SERVER['QUERY_STRING']));

            if (!empty($filters['columns'])) {
                $filters['columns'] = explode(',', $filters['columns']);
            }
        } else {
            $cacheKey = sprintf("%s", str_replace('\\', '_', $this->dataType));
        }

        // use cache to avoid calling API repeatedly
        $cache = \Cache::getInstance();
        if ($refresh === true) {
            $cache->delete($cacheKey);
        }
        if (!$cached = $cache->get($cacheKey)) {
            try {
                $request = $this->_xero->load($this->dataType);

                // apply filters if any
                if (!empty($filters)) {
                    $order_vals = null;

                    foreach ($filters as $key => $val) {
                        if ($key === 'columns') {
                            // columns are filtered manually after fetching data since API doesn't support that feature
                            continue;

                        } else if ($key === 'order') {
                            // check for proper order query
                            $order_vals = explode(',', $val);
                            if (count($order_vals) < 2 || !in_array($order_vals[1], ['ASC', 'DESC'])) {
                                continue;
                            }
                            //var_dump($order_vals); die;

                        // note: fromDate and toDate aren't working at the moment 11/24/2019
                        // https://github.com/calcinai/xero-php/issues/309
                        // } else if ($key === 'fromDate') {
                        //     $dateTime = DateTime::createFromFormat('Y-m-d', $val);
                        //     if ($dateTime) {
                        //         $request = $request->fromDate($dateTime);
                        //     } else {
                        //         continue;
                        //     }
                        // } else if ($key === 'toDate') {
                        //     $dateTime = DateTime::createFromFormat('Y-m-d', $val);
                        //     if ($dateTime) {
                        //         $request = $request->toDate($dateTime);
                        //     } else {
                        //         continue;
                        //     }
                        } else {
                            // $request = $request->where($key, $val);
                            // Found a way to do partial match
                            // https://github.com/calcinai/xero-php/issues/385
                            $request = $request->where($key . ' != null AND ' . $key . '.Contains("' . $val . '")');
                        }
                    }
                }
                if ($order_vals) {
                    $request = $request->orderBy($order_vals[0],  $order_vals[1]);
                }

                $data = $request->execute();
            } catch (NotFoundException $exception) {
                return array(
                    'status' => 'error',
                    'errors' => 'Could not fetch data'  
                );
            } catch (RateLimitExceededException $exception) {
                return array(
                    'status' => 'error',
                    'errors' => 'Rate limit exceeded'  
                );
            } catch (BadRequestException $exception) {
                return array(
                    'status' => 'error',
                    //'errors' => "One or more values are incompatible with their columns being filtered.\nPlease remove some filters and try again"
                    'errors' => $exception->getMessage()
                );
            }

            list($data, $columns) = $this->processData($data, $filters);
            $cache->set($cacheKey, serialize(array(
                'data' => $data,
                'columns' => $columns
            )));
        } else {
            $cached = unserialize($cached);
            $data = $cached['data'];
            $columns = $cached['columns'];
        }

        // if (isset($_GET['debug'])) {
        //     echo '<pre>' . json_encode($columns, JSON_PRETTY_PRINT) . '</pre><br/><br/>';
        //     echo '<pre>' . json_encode($data, JSON_PRETTY_PRINT) . '</pre>';
        //     die;
        // }

        if ($export === true) {

            $this->downloadToCsv($data, $columns);

        } else {

            return array(
                'status' => 'success',
                'msg' => !is_null($page) ?
                    sprintf('Data was successfully fetched for page %s of %s data type', $page, $this->dataType) :
                    sprintf('Data was successfully fetched for %s data type', $this->dataType),
                'data' => $data,
                'columns' => $columns
            );

        }
    }

    public function processData($rawData, $filters = null) {
        // copy the data to convert it to an array
        $data = json_decode(json_encode($rawData), true);
        // copy the data again for the purpose of sorting it without
        // affecting the original order
        $sortedData = json_decode(json_encode($data), true);
        $columns = [];

        // sort from rows with _most columns_ of data to the least
        usort($sortedData, function($a, $b) {
            $aCount = count(array_keys($a));
            $bCount = count(array_keys($b));
            if ($aCount == $bCount) {
                return 0;
            }
            return $bCount > $aCount ? 1 : -1;
        });

        // the first item now has the most columns with data
        // iterate through only the first item, and make an array
        // of all the distinct columns in the entire data
        foreach ($sortedData[0] as $key => $value) {
            // filter columns
            if (!empty($filters['columns']) && in_array($key, $filters['columns'])) {
                continue;
            }

            $columns[] = $key;
        }

        // however, this _still_ isn't good enough
        // why? the first item could still itself be missing some columns that
        // others might have
        // so effectively, there's one more step in the process
        // further filter the rows using the most "common" columns we just found,
        // and find any extraneous columns among the whole data set again by
        // using map-filter-reduce
        $extraColumns = array_map(function($item) use ($columns) {
            return array_filter(array_keys($item), function($key) use ($columns) {
                return !in_array($key, $columns);
            });
        }, $data);
        // reduce
        $extraColumns = array_reduce($extraColumns, function($collection, $keys) use ($filters) {
            if (empty($keys)) {
                return $collection;
            }

            foreach ($keys as $key) {
                // filter columns
                if (!empty($filters['columns'] && in_array($key, $filters['columns']))) {
                    continue;
                }
                if (!in_array($key, $collection)) {
                    $collection[] = $key;
                }
            }
            return $collection;
        }, array());

        // finally, gather all the columns in one var
        $columns = array_merge($columns, $extraColumns);

        // loop through data once more to create the full table of JSON values (no missing columns)
        $finalData = [];
        foreach ($data as $item) {
            $row = [];
            foreach ($columns as $col) {
                $val = $item[$col];
                if (is_array($val)) {
                    $val = implode(', ', array_map($val, function($subVal) {
                        return $val[array_keys($subVal)[0]];
                    }));
                } else if (empty($val)) {
                    $val = '';
                }

                $row[$col] = $val;
            }
            $finalData[] = $row;
        }

        return array($finalData, $columns);
    }

    // funnels the Xero data into a CSV file and lets the user download it through the browser
    public function downloadToCsv($data, $columns) {
        header('Content-type: application/csv');

        $filename = sprintf('%s_%s', get_class($this), md5(date('ymdhis') . uniqid())) . '.csv';
        header("Content-Disposition: attachment; filename=$filename");

        $fp = fopen('php://output', 'r+');

        fputcsv($fp, $columns);
        foreach ($data as $item) {
            fputcsv($fp, $item);
        }
        fclose($fp);
        die;
    }
}