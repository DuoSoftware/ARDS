package main

import (
	"code.google.com/p/gorest"
	"fmt"
)

type SelectionAlgo struct {
	gorest.RestService `root:"/SelectionAlgo/" consumes:"application/json" produces:"application/json"`
	basicSelection     gorest.EndPoint `method:"GET" path:"/Select/BasicSelection/{Company:int}/{Tenant:int}/{SessionId:string}" output:"[]string"`
}

func (selectionAlgo SelectionAlgo) BasicSelection(Company, Tenant int, SessionId string) []string {

	const longForm = "Jan 2, 2006 at 3:04pm (MST)"

	fmt.Println(Company)
	fmt.Println(Tenant)
	fmt.Println(SessionId)

	ch := make(chan []string)

	go BasicSelection(Company, Tenant, SessionId, ch)
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

type ByStringValue []string

func (a ByStringValue) Len() int           { return len(a) }
func (a ByStringValue) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByStringValue) Less(i, j int) bool { return a[i] < a[j] }
