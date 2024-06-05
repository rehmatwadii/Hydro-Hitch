import React from "react";
import hero2 from "../Assests/hero2.jpg";
export default function Header() {
  return (
    <div>
      <section class="text-gray-600 body-font">
        <div
          class="container px-5 py-6 mx-auto flex flex-wrap"
          bis_skin_checked="1"
        >
          <div
            class="lg:w-1/2 w-full mb-10 lg:mb-0 rounded-lg overflow-hidden"
            bis_skin_checked="1"
          >
            <img
              alt="feature"
              class="object-cover object-center "
              src="https://www.h2goapp.com/images/water-demand.png"
            />
          </div>
          <div
            class="flex flex-col flex-wrap lg:py-6 -mb-10 lg:w-1/2 lg:pl-12 lg:text-left text-center"
            bis_skin_checked="1"
          >
            <div className="my-3">
            <h1 className="text-4xl text-black font-bold my-3">Water On Demand</h1>
            <p className="leading-relaxed text-base">
              *in some areas, delivery will be made in 1 to 3 business day.
            </p>
            </div>
            <div
              class="flex mb-6 lg:items-start items-center"
              bis_skin_checked="1"
            >
              <img
                src="https://www.h2goapp.com/images/water-demand-icon-1.svg"
                alt="Water Demand Icon"
              />
              <div class="flex-grow ml-4" bis_skin_checked="1">
                <h2 class="text-gray-900 text-lg title-font font-medium mb-0 ">
                  Fingertip Ordering
                </h2>
                <p class="leading-relaxed text-base">
                  Easy sign up and delivery process. No need to call and sign
                  into a contract.
                </p>
              </div>
            </div>
            <div
              class="flex mb-6 lg:items-start items-center"
              bis_skin_checked="1"
            >
              <img src="https://www.h2goapp.com/images/water-demand-icon-2.svg" />
              <div class="flex-grow ml-4" bis_skin_checked="1">
                <h2 class="text-gray-900 text-lg title-font font-medium mb-0">
                  On Demand
                </h2>
                <p class="leading-relaxed text-base">
                  One time delivery or recurring deliveries base on customer
                  need.
                </p>
              </div>
            </div>
            <div
              class="flex mb-6 lg:items-start items-center"
              bis_skin_checked="1"
            >
              <img src="https://www.h2goapp.com/images/water-demand-icon-3.svg" />
              <div class="flex-grow ml-4" bis_skin_checked="1">
                <h2 class="text-gray-900 text-lg title-font font-medium mb-0">
                  No Need To Wait For The Truck Route
                </h2>
                <p class="leading-relaxed text-base">
                  Delivery on the day that customer desires.
                </p>
              </div>
            </div>
            <div
              class="flex mb-6 lg:items-start items-center"
              bis_skin_checked="1"
            >
              <img src="https://www.h2goapp.com/images/water-demand-icon-4.svg" />
              <div class="flex-grow ml-4" bis_skin_checked="1">
                <h2 class="text-gray-900 text-lg title-font font-medium mb-0">
                  Customer In Control
                </h2>
                <p class="leading-relaxed text-base">
                  App Notifications when delivery is on the way and completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
