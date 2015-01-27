package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

func BasicSelection(_company, _tenent int, _sessionId string, ch chan []string) {
	requestKey := fmt.Sprintf("Request:%d:%d:%s", _company, _tenent, _sessionId)
	fmt.Println(requestKey)
	request, _ := client.Get(requestKey)
	strResObj := string(request[:])
	fmt.Println(strResObj)

	var reqObj Request
	json.Unmarshal(request, &reqObj)

	var tagArray = make([]string, 5)

	tagArray[0] = fmt.Sprintf("company_%d", reqObj.Company)
	tagArray[1] = fmt.Sprintf("tenant_%d", reqObj.Tenant)
	tagArray[2] = fmt.Sprintf("class_%s", reqObj.Class)
	tagArray[3] = fmt.Sprintf("type_%s", reqObj.Type)
	tagArray[4] = fmt.Sprintf("category_%s", reqObj.Category)
	//for _, value := range reqObj.AttributeInfo {
	//fmt.Println(value.AttributeCode)
	//tagArray = AppendIfMissing(tagArray, fmt.Sprintf("attribute_%s", value.AttributeCode))
	//}

	tags := fmt.Sprintf("tag:*%s*", strings.Join(tagArray, "*"))
	fmt.Println(tags)
	val, _ := client.Keys(tags)
	lenth := len(val)
	fmt.Println(lenth)

	var matchingResources = make([]string, 0)
	for _, match := range val {
		resKey, _ := client.Get(match)
		strResKey := string(resKey[:])
		AppendIfMissing(matchingResources, strResKey)
		fmt.Println(strResKey)
	}

	ch <- matchingResources

}

func AppendIfMissing(tagList []string, i string) []string {
	for _, ele := range tagList {
		if ele == i {
			return tagList
		}
	}
	return append(tagList, i)
}
