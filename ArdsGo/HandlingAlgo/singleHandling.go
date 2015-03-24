package main

import (
	"encoding/json"
	"fmt"
	"github.com/fzzy/radix/redis"
	"strings"
)

func SingleHandling(sessionId string, resourceIds []string, ch chan string) {
	ch <- SelectHandlingResource(sessionId, resourceIds)
}

func SelectHandlingResource(sessionId string, resourceIds []string) string {
	client, err := redis.Dial("tcp", redisIp)
	errHndlr(err)
	defer client.Close()

	// select database
	r := client.Cmd("select", redisDb)
	errHndlr(r.Err)

	for _, key := range resourceIds {
		fmt.Println(key)
		strResObj, _ := client.Cmd("get", key).Str()
		fmt.Println(strResObj)

		var resObj Resource
		json.Unmarshal([]byte(strResObj), &resObj)

		conInfo := GetConcurrencyInfo(resObj.Company, resObj.Tenant, resObj.ResourceId, resObj.Class, resObj.Type, resObj.Category)

		metaData := GetReqMetaData(resObj.Company, resObj.Tenant, resObj.Class, resObj.Type, resObj.Category)

		if conInfo.RejectCount < metaData.MaxRejectCount {
			ClearSlotOnMaxRecerved(resObj, metaData)

			var tagArray = make([]string, 8)

			tagArray[0] = fmt.Sprintf("company_%d", resObj.Company)
			tagArray[1] = fmt.Sprintf("tenant_%d", resObj.Tenant)
			tagArray[2] = fmt.Sprintf("class_%s", resObj.Class)
			tagArray[3] = fmt.Sprintf("type_%s", resObj.Type)
			tagArray[4] = fmt.Sprintf("category_%s", resObj.Category)
			tagArray[5] = fmt.Sprintf("state_%s", "Available")
			tagArray[6] = fmt.Sprintf("resourceid_%s", resObj.ResourceId)
			tagArray[7] = fmt.Sprintf("objtype_%s", "CSlotInfo")

			tags := fmt.Sprintf("tag:*%s*", strings.Join(tagArray, "*"))
			fmt.Println(tags)
			availableSlots, _ := client.Cmd("keys", tags).List()

			for _, tagKey := range availableSlots {
				strslotKey, _ := client.Cmd("get", tagKey).Str()
				fmt.Println(strslotKey)

				strslotObj, _ := client.Cmd("get", strslotKey).Str()
				fmt.Println(strslotObj)

				var slotObj CSlotInfo
				json.Unmarshal([]byte(strslotObj), &slotObj)

				slotObj.State = "Reserved"
				slotObj.SessionId = sessionId

				if ReserveSlot(slotObj) == true {
					fmt.Println("Return resource Data:", resObj.OtherInfo)
					return resObj.OtherInfo
				}
			}
		}

	}
	return "No matching resources at the moment"
}
