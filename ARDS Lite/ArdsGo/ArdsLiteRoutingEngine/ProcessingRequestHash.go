package main

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"
)

func GetAllProcessingHashes() []string {
	processingHashSearchKey := fmt.Sprintf("ProcessingHash:%s:%s", "*", "*")
	processingHashes := RedisSearchKeys(processingHashSearchKey)
	return processingHashes
}

func GetAllProcessingItems(_processingHashKey string) []Request {
	fmt.Println(_processingHashKey)
	keyItems := strings.Split(_processingHashKey, ":")

	company := keyItems[1]
	tenant := keyItems[2]
	strHash := RedisHashGetAll(_processingHashKey)

	processingReqObjs := make([]Request, 0)

	for k, v := range strHash {
		fmt.Println("k:", k, "v:", v)
		requestKey := fmt.Sprintf("Request:%s:%s:%s", company, tenant, v)
		strReqObj := RedisGet(requestKey)
		fmt.Println(strReqObj)

		if strReqObj == "" {
			fmt.Println("Start SetNextProcessingItem")
			SetNextProcessingItem(_processingHashKey, k)
		} else {
			var reqObj Request
			json.Unmarshal([]byte(strReqObj), &reqObj)

			processingReqObjs = AppendIfMissingReq(processingReqObjs, reqObj)
		}
	}
	return processingReqObjs
}

func SetNextProcessingItem(_processingHash, _queueId string) {
	nextQueueItem := RedisListLpop(_queueId)
	if nextQueueItem == "" {
		removeHResult := RedisRemoveHashField(_processingHash, _queueId)
		if removeHResult {
			fmt.Println("Remove HashField Success.." + _processingHash + "::" + _queueId)
		} else {
			fmt.Println("Remove HashField Failed.." + _processingHash + "::" + _queueId)
		}
	} else {
		setHResult := RedisHashSetField(_processingHash, _queueId, nextQueueItem)
		if setHResult {
			fmt.Println("Set HashField Success.." + _processingHash + "::" + _queueId + "::" + nextQueueItem)
		} else {
			fmt.Println("Set HashField Failed.." + _processingHash + "::" + _queueId + "::" + nextQueueItem)
		}
	}
}

func GetLongestWaitingItem(_request []Request) Request {
	longetWaitingItem := Request{}
	reqCount := len(_request)
	longetWaitingItemArriveTime := time.Now()

	if reqCount > 0 {
		for _, req := range _request {
			arrTime, _ := time.Parse(layout, req.ArriveTime)
			if arrTime.Before(longetWaitingItemArriveTime) {
				longetWaitingItemArriveTime = arrTime
				longetWaitingItem = req
			}
		}
	}

	return longetWaitingItem
}

func ContinueArdsProcess(_request Request) bool {
	var result = SelectResources(_request.Company, _request.Tenant, _request.SessionId, _request.Class, _request.Type, _request.Category, _request.SelectionAlgo, _request.HandlingAlgo)

	_request.HandlingResource = result

	req, _ := json.Marshal(_request)
	if Post(ardsUrl, string(req[:])) {
		fmt.Println("Continue Ards Process Success")
		return true
	} else {
		fmt.Println("Continue Ards Process Failed")
		return false
	}

	return true
}

func GetRequestState(_company, _tenant int, _sessionId string) string {
	reqStateKey := fmt.Sprintf("RequestState:%d:%d:%s", _company, _tenant, _sessionId)
	reqState := RedisGet(reqStateKey)
	return reqState
}

func ExecuteRequestHash(_processingHashKey string) {
	processingItems := GetAllProcessingItems(_processingHashKey)
	sort.Sort(timeSliceReq(processingItems))
	for _, longestWItem := range processingItems {
		if longestWItem != (Request{}) {
			//SetNextProcessingItem(_processingHashKey, longestWItem.QueueId)
			if GetRequestState(longestWItem.Company, longestWItem.Tenant, longestWItem.SessionId) == "QUEUED" {
				if ContinueArdsProcess(longestWItem) {
					//SetNextProcessingItem(_processingHashKey, longestWItem.QueueId)
					fmt.Println("Continue ARDS Process Success")
				}
			}
		}
	}
}
