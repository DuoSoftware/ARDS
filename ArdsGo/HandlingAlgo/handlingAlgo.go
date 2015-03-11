package main

import (
	"code.google.com/p/gorest"
	"encoding/json"
	"fmt"
)

type HandlingAlgo struct {
	gorest.RestService `root:"/HandlingAlgo/" consumes:"application/json" produces:"application/json"`
	singleResource     gorest.EndPoint `method:"GET" path:"/Single/{Company:int}/{Tenant:int}/{Class:string}/{Type:string}/{Category:string}/{SessionId:string}/{ResourceIds:string}" output:"string"`
}

func (handlingAlgo HandlingAlgo) SingleResource(Company, Tenant int, Class, Type, Category, SessionId, ResourceIds string) string {
	ch := make(chan string)
	fmt.Println(ResourceIds)
	byt := []byte(ResourceIds)
	var resourceIds []string
	json.Unmarshal(byt, &resourceIds)
	go SingleHandling(SessionId, resourceIds, ch)
	var result = <-ch
	close(ch)
	return result

}

func AppendIfMissing(dataList []string, i string) []string {
	for _, ele := range dataList {
		if ele == i {
			return dataList
		}
	}
	return append(dataList, i)
}
