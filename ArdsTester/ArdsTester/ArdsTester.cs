using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    public class ArdsTester:IArdsTester
    {
        public string Invoke(Request request)
        {
            string selectionResult = string.Empty;
            string handlingResource = string.Empty;

            var preProObj = Prepocessor.process(request);
            var val = JObject.FromObject(JObject.Parse(preProObj));
            var addReq = request.Add(preProObj);

            switch (val.Value<string>("SelectionAlgo"))
            {
                case "BASIC":
                    selectionResult = Selection.BasicSelection(val.Value<int>("Company"), val.Value<int>("Tenant"), val.Value<string>("SessionId"));
                    break;

                default:
                    selectionResult = string.Empty;
                    break;

            }

            switch (val.Value<string>("HandlingAlgo"))
            {
                case "SINGLE":
                    handlingResource = Handling.SingleHandling(val.Value<int>("Company"), val.Value<int>("Tenant"), val.Value<string>("Class"), val.Value<string>("Type"), val.Value<string>("Category"), val.Value<string>("SessionId"), selectionResult);
                    break;

                default:
                    handlingResource = string.Empty;
                    break;
            }

            return handlingResource;
        }
    }
}
