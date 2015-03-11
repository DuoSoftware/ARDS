using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace ArdsTester
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                using (var host = new ServiceHost(typeof(ArdsTester)))
                {
                    host.Open();
                    Console.WriteLine("Press Enter To Exit!");

                    Console.ReadLine();

                    while (true)
                    {
                        Console.ReadLine();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                Console.ReadLine();
            }
        }
    }
}
