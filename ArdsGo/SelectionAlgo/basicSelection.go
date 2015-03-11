package main

import (
	"encoding/json"
	"fmt"
	"github.com/fzzy/radix/redis"
	"strings"
)

func BasicSelection(_company, _tenent int, _sessionId string, ch chan []string) {
	requestKey := fmt.Sprintf("Request:%d:%d:%s", _company, _tenent, _sessionId)
	fmt.Println(requestKey)

	client, err := redis.Dial("tcp", redisIp)
	errHndlr(err)
	defer client.Close()

	// select database
	r := client.Cmd("select", redisDb)
	errHndlr(r.Err)
	strResObj, _ := client.Cmd("get", requestKey).Str()
	fmt.Println(strResObj)

	var reqObj Request
	json.Unmarshal([]byte(strResObj), &reqObj)

	var matchingResources = make([]string, 0)
	if len(reqObj.AttributeInfo) > 0 {
		var tagArray = make([]string, 6)

		tagArray[0] = fmt.Sprintf("company_%d", reqObj.Company)
		tagArray[1] = fmt.Sprintf("tenant_%d", reqObj.Tenant)
		tagArray[2] = fmt.Sprintf("class_%s", reqObj.Class)
		tagArray[3] = fmt.Sprintf("type_%s", reqObj.Type)
		tagArray[4] = fmt.Sprintf("category_%s", reqObj.Category)
		tagArray[5] = fmt.Sprintf("objtype_%s", "Resource")
		for _, value := range reqObj.AttributeInfo {
			for _, att := range value.AttributeCode {
				fmt.Println("attCode", att)
				tagArray = AppendIfMissing(tagArray, fmt.Sprintf("attribute_%s", att))
			}
		}

		tags := fmt.Sprintf("tag:*%s*", strings.Join(tagArray, "*"))
		fmt.Println(tags)
		val, _ := client.Cmd("keys", tags).List()
		lenth := len(val)
		fmt.Println(lenth)

		for _, match := range val {
			strResKey, _ := client.Cmd("get", match).Str()
			matchingResources = AppendIfMissing(matchingResources, strResKey)
			fmt.Println(strResKey)
		}
	}

	ch <- matchingResources

}
