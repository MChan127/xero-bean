<?php
use XeroPHP\Application\PrivateApplication;

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
    
    public function getData($refresh = null) {
        $filters = null;

        // check if request has any filters 
        parse_str($_SERVER['QUERY_STRING'], $filters);
        unset($filters['type']);
        unset($filters['debug']);
        unset($filters['refresh']);
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
                    foreach ($filters as $key => $val) {
                        if ($key === 'columns') {
                            // columns are filtered manually after fetching data since API doesn't support that feature
                            continue;
                        } else if ($key === 'order') {
                            // check for proper order query
                            if (!in_array($val, ['ASC', 'DESC'])) {
                                continue;
                            }
                            $request = $request->orderBy($key, $val);

                        // note: fromDate and toDate aren't working at the moment 11/24/2019
                        } else if ($key === 'fromDate') {
                            $dateTime = DateTime::createFromFormat('Y-m-d', $val);
                            if ($dateTime) {
                                $request = $request->fromDate($dateTime);
                            } else {
                                continue;
                            }
                        } else if ($key === 'toDate') {
                            $dateTime = DateTime::createFromFormat('Y-m-d', $val);
                            if ($dateTime) {
                                $request = $request->toDate($dateTime);
                            } else {
                                continue;
                            }
                        } else {
                            $request = $request->where($key, $val);
                        }
                    }
                }

                $data = $request->execute();
            } catch (NotFoundException $exception) {
                return array(
                    'status' => 'error',
                    'msg' => 'Could not fetch data'  
                );
            } catch (RateLimitExceededException $exception) {
                return array(
                    'status' => 'error',
                    'msg' => 'Rate limit exceeded'  
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

        if (isset($_GET['debug'])) {
            echo '<pre>' . json_encode($columns, JSON_PRETTY_PRINT) . '</pre><br/><br/>';
            echo '<pre>' . json_encode($data, JSON_PRETTY_PRINT) . '</pre>';
            die;
        }

        return array(
            'status' => 'success',
            'msg' => !is_null($page) ?
                sprintf('Data was successfully fetched for page %s of %s data type', $page, $this->dataType) :
                sprintf('Data was successfully fetched for %s data type', $this->dataType),
            'data' => $data,
            'columns' => $columns
        );
    }

    public function processData($rawData, $filters = null) {
        $data = json_decode(json_encode($rawData), true);
        $columns = [];

        // sort from rows with _most columns_ of data to the least
        usort($data, function($a, $b) {
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
        foreach ($data[0] as $key => $value) {
            // filter columns
            if (!empty($filters['columns'] && in_array($key, $filters['columns']))) {
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
}