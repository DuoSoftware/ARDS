using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class StartArds:IStartArds
    {
        public string Start(InputData Request1)
        {
            var preProObj = Prepocessor.process(Request1);
            var val = JObject.FromObject(JObject.Parse(preProObj));
            var addReq = Request.Add(preProObj);
            var reply = string.Empty;

            switch (val.Value<string>("ReqHandlingAlgo"))
            {
                case "QUEUE":
                    if (ReqQueue.AddToQueue(preProObj))
                    {
                        reply = string.Format("Request Added to QUEUE. ID:: {0}", val.Value<string>("QueueId"));
                    }
                    else
                    {
                        reply = string.Format("Request Added to QUEUE Failed. ID:: {0}", val.Value<string>("QueueId"));
                    }
                    break;

                case "DIRECT":
                    var cards = new ContinueArds();
                    var req = Newtonsoft.Json.JsonConvert.DeserializeObject<Request>(preProObj);
                    reply = cards.Continue(req);
                    break;

                default:
                    reply = string.Empty;
                    break;

            }

            return reply;
        }


        public bool RemoveRequest(int company, int tenant, string sessionId)
        {
            return Request.Remove(company, tenant, sessionId);
        }
    }
}
