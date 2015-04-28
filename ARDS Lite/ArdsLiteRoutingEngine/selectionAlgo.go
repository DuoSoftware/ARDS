package main

import (
	"encoding/json"
	"fmt"
	"github.com/fzzy/radix/redis"
)

func BasicSelectionAlgo(Company, Tenant int, SessionId string) []string {

	const longForm = "Jan 2, 2006 at 3:04pm (MST)"

	fmt.Println(Company)
	fmt.Println(Tenant)
	fmt.Println(SessionId)

	var result = BasicSelection(Company, Tenant, SessionId)
	return result

}

func GetConcurrencyInfo(_company, _tenant int, _resId, _class, _type, _category string) ConcurrencyInfo {
	client, err := redis.Dial("tcp", redisIp)
	errHndlr(err)
	defer client.Close()

	// select database
	r := client.Cmd("select", redisDb)
	errHndlr(r.Err)
	key := fmt.Sprintf("ConcurrencyInfo:%d:%d:%s:%s:%s:%s", _company, _tenant, _resId, _class, _type, _category)
	fmt.Println(key)
	strCiObj, _ := client.Cmd("get", key).Str()
	fmt.Println(strCiObj)

	var ciObj ConcurrencyInfo
	json.Unmarshal([]byte(strCiObj), &ciObj)

	return ciObj
}
