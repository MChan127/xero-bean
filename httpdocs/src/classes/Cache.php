<?php
use Phpfastcache\CacheManager;
use Phpfastcache\Config\ConfigurationOption;

class Cache {
    private static $cache;
    private $_cacheInstance;

    private $EXPIRES_AFTER = 604800; // 1 week in seconds

    private function __construct() {
        CacheManager::setDefaultConfig(new ConfigurationOption([
            'path' => ROOT_DIR . 'cache'
        ]));

        $this->_cacheInstance = CacheManager::getInstance('files');
    }

    public static function getInstance() {
        if (!self::$cache) {
            self::$cache = new Cache();
        }
        return self::$cache;
    }

    public function get($key) {
        $cachedItem = $this->_cacheInstance->getItem($key);

        if ($cachedItem->isHit() && !$cachedItem->isExpired() && !$cachedItem->isEmpty()) {
            return $cachedItem->get();
        } else {
            // delete the cached item for good measure
            $this->delete($key);
            return false;
        }
    }

    public function set($key, $data) {
        $cachedItem = $this->_cacheInstance->getItem($key);
        
        $cachedItem->set($data)->expiresAfter($this->EXPIRES_AFTER);
        $this->_cacheInstance->save($cachedItem);
    }

    public function delete($key) {
        $this->_cacheInstance->deleteItem($key);
    }
}