package main

import (
	"encoding/json"
	"fmt"
	"os"
)

var redisIp string
var redisDb int

const layout = "2006-01-02T15:04:05Z07:00"

func errHndlr(err error) {
	if err != nil {
		fmt.Println("error:", err)
	}
}

func InitiateRedis() {
	file, _ := os.Open("conf.json")
	decoder := json.NewDecoder(file)
	configuration := Configuration{}
	err := decoder.Decode(&configuration)
	if err != nil {
		fmt.Println("error:", err)
		redisIp = "127.0.0.1:6379"
		redisDb = 6
	} else {
		redisIp = configuration.RedisIp
		redisDb = configuration.RedisDb
	}

	fmt.Println("RedisIp:", redisIp)
	fmt.Println("RedisDb:", redisDb)

}
