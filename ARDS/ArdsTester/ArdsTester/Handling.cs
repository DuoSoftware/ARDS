using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace ArdsTester
{
    public class Handling
    {
        public static string SingleHandling(string reqClass, string reqType, string reqCategory, string sessionId, string resourceIds)
        {
            try
            {
                //var arr = new string[] { "a", "b", "c" };
                string longurl = "http://localhost:2223/HandlingAlgo/Single/" + reqClass + "/" + reqType + "/" + reqCategory + "/" + sessionId + "/" + resourceIds + "";
                var uriBuilder = new UriBuilder(longurl);

                var query = HttpUtility.ParseQueryString(uriBuilder.Query);
                //query["Ids"] = Newtonsoft.Json.JsonConvert.SerializeObject(arr);
                uriBuilder.Query = query.ToString();
                longurl = uriBuilder.ToString();

                var httpWReq = (HttpWebRequest)WebRequest.Create(longurl);

                var encoding = new ASCIIEncoding();

                httpWReq.Method = "GET";
                httpWReq.Accept = "application/json";
                httpWReq.ContentType = "application/json";

                var response = (HttpWebResponse)httpWReq.GetResponse();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
                    response.Close();
                    return responseString;
                    //    var result = JObject.FromObject(JObject.Parse(responseString)["ResourceStatusChangeBusyResult"]);
                    //    this.lbl_Code.Text = ((WorkflowResultCode)result["Command"].Value<int>()).ToString();
                    //    this.lbl_Message.Text = result["ResultString"].Value<string>();
                }

                response.Close();
                return string.Empty;
            }
            catch (Exception e)
            {
                Console.WriteLine("SingleHandling :: " + e.Message);
                return string.Empty;
            }
        }
    }
}
