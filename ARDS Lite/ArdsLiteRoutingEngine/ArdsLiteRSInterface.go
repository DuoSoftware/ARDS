package main

import (
	"code.google.com/p/gorest"
	"fmt"
)

type ArdsLiteRS struct {
	gorest.RestService `root:"/resourceselection/" consumes:"application/json" produces:"application/json"`
	getResource        gorest.EndPoint `method:"GET" path:"/getresource/{Company:int}/{Tenant:int}/{SessionId:string}/{ReqClass:string}/{ReqType:string}/{ReqCategory:string}/{SelectionAlgo:string}/{HandlingAlgo:string}" output:"string"`
}

func (ardsLiteRs ArdsLiteRS) GetResource(Company, Tenant int, SessionId, ReqClass, ReqType, ReqCategory, SelectionAlgo, HandlingAlgo string) string {

	const longForm = "Jan 2, 2006 at 3:04pm (MST)"

	fmt.Println(Company)
	fmt.Println(Tenant)
	fmt.Println(SessionId)

	var result = SelectResources(Company, Tenant, SessionId, ReqClass, ReqType, ReqCategory, SelectionAlgo, HandlingAlgo)

	return result

}

func SelectResources(Company, Tenant int, SessionId, ReqClass, ReqType, ReqCategory, SelectionAlgo, HandlingAlgo string) string {
	var selectionResult = make([]string, 0)
	var handlingResult = ""
	switch SelectionAlgo {
	case "BASIC":
		selectionResult = BasicSelectionAlgo(Company, Tenant, SessionId)
	case "WEIGHTBASE":
		selectionResult = WeightBaseSelectionAlgo(Company, Tenant, SessionId)
	default:
		selectionResult = make([]string, 0)
	}

	switch HandlingAlgo {
	case "SINGLE":
		handlingResult = SingleResourceAlgo(ReqClass, ReqType, ReqCategory, SessionId, selectionResult)
	default:
		handlingResult = ""
	}

	return handlingResult
}
