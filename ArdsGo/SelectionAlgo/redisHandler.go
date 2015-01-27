package main

import (
	"encoding/json"
	"fmt"
	"github.com/xuyu/goredis"
	"os"
)

var client *goredis.Redis

const layout = "Jan 2, 2006 at 3:04pm (MST)"

func InitiateRedis() {
	var redisIp string
	var redisDb int
	file, _ := os.Open("conf.json")
	decoder := json.NewDecoder(file)
	configuration := Configuration{}
	err := decoder.Decode(&configuration)
	if err != nil {
		fmt.Println("error:", err)
		redisIp = "127.0.0.1:6379"
		redisDb = 8
	} else {
		redisIp = configuration.RedisIp
		redisDb = configuration.RedisDb
	}

	fmt.Println("RedisIp:", redisIp)
	fmt.Println("RedisDb:", redisDb)

	client, err = goredis.Dial(&goredis.DialConfig{Address: redisIp, Database: redisDb, MaxIdle: 10})
	if err == nil {
		fmt.Println("Redis client connected ..............")
	} else {
		fmt.Println(err.Error())
	}
}
