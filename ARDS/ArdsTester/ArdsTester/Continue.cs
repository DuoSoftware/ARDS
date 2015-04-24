using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class ContinueArds: IContinueArds
    {
        public string Continue(Request request)
        {
            string selectionResult = string.Empty;
            string handlingResource = string.Empty;

            if (request != null)
            {
                switch (request.SelectionAlgo)
                {
                    case "BASIC":
                        selectionResult = Selection.BasicSelection(request.Company, request.Tenant, request.SessionId);
                        break;

                    default:
                        selectionResult = string.Empty;
                        break;
                }

                switch (request.HandlingAlgo)
                {
                    case "SINGLE":
                        handlingResource = Handling.SingleHandling(request.Class, request.Type, request.Category, request.SessionId, selectionResult);
                        if (request.ReqHandlingAlgo.Equals("QUEUE") && !handlingResource.Equals("No matching resources at the moment"))
                        {
                            var pHashId = string.Format("ProcessingHash:{0}:{1}", request.Company, request.Tenant);
                            ReqQueue.SetNextProcessingItem(request.QueueId, pHashId);
                        }
                        break;

                    default:
                        handlingResource = string.Empty;
                        break;
                }

                switch (request.ServingAlgo)
                {
                    case "CALLBACK":
                        //Task.Factory.StartNew(() => SendCallback(handlingResource, request.RequestServerUrl, request.SessionId));
                        if (!handlingResource.Equals("No matching resources at the moment"))
                        {
                            if (Request.SetRequestStateTrying(request.Company, request.Tenant, request.SessionId))
                            {
                                Console.WriteLine(string.Format("Update Request state to Trying SessionId:: {0}", request.SessionId));
                            }
                            else
                            {
                                Console.WriteLine(string.Format("Update Request state to Trying Failed SessionId:: {0}", request.SessionId));
                            }

                            SendCallback(handlingResource, request.RequestServerUrl, request.SessionId, request);
                        }
                        
                        break;

                    case "REPLYBASE":
                        break;

                    default:
                        handlingResource = string.Empty;
                        break;
                }
                var result = string.Format("SessionId:: {0} ::: HandlingResource:: {1}", request.SessionId, handlingResource);
                if (!handlingResource.Equals("No matching resources at the moment"))
                {
                    Console.WriteLine(result);
                }
            }
            return handlingResource;
        }

        private bool SendCallback(string result, string callbackUrl, string sessionId, Request request)
        {
            try
            {
                var httpWReq = (HttpWebRequest)WebRequest.Create(callbackUrl);

                var encoding = new ASCIIEncoding();

                var resultS = JObject.Parse(result);

                string postData = "{\"SessionID\":\"" + sessionId + "\",\"Extention\":" + resultS["Extention"].Value<int>() + ",\"DialHostName\":\"" + resultS["DialHostName"].Value<string>() + "\"}";
                byte[] data = encoding.GetBytes(postData);

                httpWReq.Method = "POST";
                httpWReq.Accept = "application/json";
                httpWReq.ContentType = "application/json";
                httpWReq.ContentLength = data.Length;

                using (Stream stream = httpWReq.GetRequestStream())
                {
                    stream.Write(data, 0, data.Length);
                }

                var response = (HttpWebResponse)httpWReq.GetResponse();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    Console.WriteLine("Result send to server success.");

                    response.Close();
                    return true;
                    //string responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
                    //return bool.Parse(responseString);
                    //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                    //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                    //    this.lbl_Message.Text = result["ResultString"].Value<string>();
                }
                else if (response.StatusCode == HttpStatusCode.ServiceUnavailable)
                {
                    Console.WriteLine("Result send to server success:: ServiceUnavailable.");
                    response.Close();

                    ReqQueue.ReAddToQueue(Newtonsoft.Json.JsonConvert.SerializeObject(request));

                    return true;
                }
                Console.WriteLine("Result send to server failed.");
                response.Close();
                return false;
            }
            catch (Exception e)
            {
                if (e.Message.Equals("The remote server returned an error: (503) Server Unavailable."))
                {
                    Console.WriteLine("Result send to server success:: ServiceUnavailable.");

                    ReqQueue.ReAddToQueue(Newtonsoft.Json.JsonConvert.SerializeObject(request));

                    return true;
                }
                Console.WriteLine("SendCallback :: "+e.Message);
                return false;
            }
        }
    }
}
