import React from "react";
import {
  FaCreditCard,
  FaUniversity,
  FaWallet,
  FaMoneyBillWave,
  FaQrcode,
} from "react-icons/fa";

const paymentData = [
  {
    category: "Cards",
    icon: <FaCreditCard className="w-5 h-5 text-blue-600" />,
    methods: [
      {
        name: "Visa",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Visa_Logo.png/512px-Visa_Logo.png",
      },
      {
        name: "MasterCard",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/512px-Mastercard-logo.svg.png",
      },
      {
        name: "RuPay",
        logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQsAAAC9CAMAAACTb6i8AAAA/1BMVEX///83OYv0byAJekQ1N4oxM4kvMYgfIoMmKYUcH4IZHIEzNYksLochJIMuMIgpK4a4udIXGoHzZAD09Pju7vT/bhzOzt8Adz96e6za2uff3+r5+fuurst/gK/l5e70ahAAbi1TVJiXmL1vcKZISpPU1OOjpMTExNhmZ6GHiLNERZFbXJxzdKj97eY8Po7zYAAACX3T49r4pYFIkWn6w62oqcfCciz839Q/eUBgYZ7LcioAbCji7OednsGRkbmQuaL2k2X5tJf1gUbE2M2DsJYJDn770cAfgU/r+vipuKC2cy6hdDKKdTZhnXtzdzpaeD2qyLfjcCSSjV/3nHP4q4rq3N4OAAAKqklEQVR4nO2beX/iyBGGAetEEkLAcB8GbAS+5yCOM4HxzO7sbI5NNsl+/88SHd1d1S2OgJjfjif1/GMbpFbrVXX1W91yoUAQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEG8TIad7nDYaDTq9V7v9+7L703FNk07plwOAtu0XOfu6uJ6frOY9JtHiTN4KNum51m+W9Gd4l3U2vh6Ph2sl+Hw1H0/MUO7KKFFOI6j64ZrecHNEd13NN6OBq3pRsX3bGf1TYde3y/uwAhmhzaoiisJ7XvVr3ETJ2Ku79KiWLTXBza4W9xisPoqt3EKeuXdUkSdvzysxX3iHtreXh5v2S8fcjbU9PZpod8c1qKt7W7PucrZZZV3/2G/vH+dr6F1ZZ8WmndQg/vFtU8cGM/3aWC8fv82X0N3e55iRHBQ7p+4+9pzD81Ae6iN3iQ/P7TOcwXGUEkXySyYS4srZ58W+jxPjzM81kppYLxttXIFBk76lh15pGjI+LaJn61mHtJgI0A3HTWYYuF86lzk6XGGj6NSGhjnZ2e5AmMKnfTCOg+A4QoNev36kAarFpx400hb7A3DJ/+rafGpVEoC44dIi1yBgZK+iz+fQd9hePc2FCy9BPi7bYC4TXTcDYgujZHeZXUymD+NI58+XaxUl97rqe1nr3gfaREHxo+ts1yBgZJ+ZYG/uPTUW2pH1UpcsXh3fXyLn8sxQRDU0w8sENfGt9A1N1ypMRsHnuUaup749Iprle+ELx26QXzFiAfcteoDu+JDI/n7p1opDYwvkRR5AgMlfSvEX3RE19mUehlo/G/kovvcb2uOel5Rf8INNsCZW6yB+iDwM4nW8cZM1UvRVAVPPEXWD2OQ/v1mVEoC4+fzWIscgXEBfSnX8RcQMGyIgGrlBhzm8CiosJ6hseVLlUwHAq2cDoR+AMMJo+t1RVYcsn2ejwLWjVJK7S+ts1yBgZK+4gZhfmHXFKrhzAePjj/ra5SLJUu19JUrDbb6U+Na0cJAWvia9IgKt/dMjD+cneUKDJT0DSldFMb81v30mg3hQ9wJHLVWg6WHZtRAahBsRxovbbh0MUoWkhjlTnzEcFNcrJikmsmS0bsa0+LVH89yBQZK+r5US1d5RDt3qmp4dhCmVWOHhWhGlabiEPJIEmgr+NsNrq7Hro1qgfQSkGH4AIy05sFkLdknz6PSaQIDJX1pApzwKNDY2EZTYhkOA9PKn9wCxJWcdt0VV9Kn0d8dET9akC7vNNYgo9lNzhFaGEKLBQtErcg/4WGRNzBQ0o+62OwOu91m2J/Mhe3URH3t8XvBswMkFT4JFUFcCwVatQKDIIgHwEUibWT3db/DD2oLudPJGFYTjDY7ROQ3k096j6BFvsBYYaute2ZEvEqpi/v2uuxISJJ4doCVCuYu8JJWZdHtdjuXzXDW9lH8JWFRuPAiY256vjuG2WvGe8Ozc1aLGxZ2+pif9HFUOk1gjHeXUf6FmD1BNbMD54s7573vo4RYrCTaRuIaaMLQgobai4yyfMCJcaUzLbo8LALRiU+l0kkCo46S/gY8NLOIGRUXaiF4EDa3TPcsaUVS9gtbaApl+egSmZmvJj2x5g1YXbrHWuQIjNDa0FkBNjjgQ3AtAYmSJ96964XudFtnlqaIHpvla/EAmBZCLYitn2ql0wTGYueSFl7agxkVpwuIfTv94HLfklZlXNhEIxx4vmhMM9jHPAxYjhHa+OBw3oxKpwkMffeSlgWBMYAIADPZFUHN55Z9S1p+tvrvhpO5UbYqqCtiBp3KWnDPo6GCuqRwbGDs2sdIMIVDgK4idyHyftFnxudiZy7WgoF0/UZ1PY636dQcIyZj4QTTgcnDENWGt/eKFscGxhLvY8Q7W466uhdUVdUc9GThzlNvtDsXO5aDC+Hh5CqwKhu14+kCxnBiYbn7xvXQu9qJAgPvY3jj+fxpfOfZHu4ej33wVMhMgunU/PST6pZcrDmGb0urHs1x2d0WQyJdwJBzxkhovL3yPFK1ODIw0BARNq4eXiGFeO0KBhwtckBYcSs0QDW4pldc37c8z7QDd9yeIVdS6M1tPC40w/dM+EAYK6j/41CYssYNvFuTCYtS6U88MH44QAq0pCWVUWgdm4ejn5nuCniI8AGOxpzmzQeTWbXavOxmvFXDQPOX5tr6oN8cgtxQJIpwjKqPJo9C7NUes1q8Ylq0zv58gBZrtKSFa1RcaqZjBCVZcFod+JB1D+YVMWo24kAMOGZxleYa0ALkRrVxj2dvNJ/KBpxJ8VcmxZdj9zGkDZAhWpgcKH3ipXkBl/s8elAultdOZQboGYxFcQy9gRkTnorGIxOSScynjBR/OypbwOKMsjCJtGBzJWwzwpFDmDN4PkW5WFoAkEEnWigRQ30u0gUexXyQmtIqS2ZG/TvLFb8cJAVO+r5UIzQzK+CwbgfzGbIS/MbRENmxuwR+bLOdR53J2lhd8q2KAS+9+geT4sfDpMBJ35Y2JdBOGlsORhW3md53B882QUbDXTvzd0JEFDwoWFBn0DYCv1QXN6Ua8H8yKQ5+9QCKCU3bJlI6OBu44jIXYdh/KiNzsMGAW9vfvUGrzTbMCJAtNAuOHapaGLJxVUYIcxbvfz1UCpT0lVVf2HhnQdyRumRYli+55g0GfPsaBZ6lTP6Qe2OQX0eFbOZNMlvatlAMOPMV7w/xFSloJMibRHWIArZFs+eFCjtjwHftl6L9E30aS1a/XBlIW65sTEPRwlpKTUkG/F851vfQqksgqQ0LNEWrv00LDUpcTWfnwQPHuwYq+NUX3bbNsu25uArCmyp1WQv1fR5kwIXDah3isDiwcuLIawpoDdRLA6aTSWGu2b7g5/MRhm7S2/HezXpPWY83VZRXycrKRF3LSnH28xFSoPtTniIKGL60GcjlqxOsezDG+AiDdLHzfY1+pn7TfPS2h/RgZC10ZUkMDDiYzSOUkDyi4otQCjTZ9DbBg0SzLuIEIWYb5llRmlE7LVFXhfWc2RCmICmPy1qoCVkY8CPNpmAaWJwH+ZsL2xPf8ERyI7Y+NbecLvJ9tqIq1LI8mz3I5oM4Ldi6vBtT/Qxia5XyOAkrMylq43Pxy5+SFr76Wig34MeaTUG3GYbVlFD+pg7fgEuoarYfYZnWOtWn0e/343ObzSE/rSlOqxd20SyaRvKKtW+aCzYKZ4PVMj0X1/Y4dzpFtR02o9b+faTZPJ5OfzZbhp39B/4PhO3r8dN0sdz3aiP2Wmri5Aa8dvuldZzZfFmgydzI5KDEgI9Gt+krKIebzRcGFGyK44yJg2JU6hV+PT/ObL4sljBEvEw6jg346FP0yy+ts5yvuH7rDMNJEa2vZbeYIgNee45/aR1pNl8Kg0B25htqvedRLXkj/vX5cWbzpRAq+yyb9qNr978lPz+cH2c2Xwpt+f0+Y8Pr44/3H9Nf3ub814BvHfn/krIuK+K3d+nP3ncuRVcq1R1v08LQI/v5PWfNGOn/1QzrW/8/zq/KQKyEaEb5aXdx873zZCZ1oGeWzcGp/03vpdHoL5fLftjs/n+HBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQL57/ApPr0edJe98YAAAAAElFTkSuQmCC",
      },
    ],
  },
  {
    category: "Net Banking",
    icon: <FaUniversity className="w-5 h-5 text-purple-600" />,
    methods: [{ name: "All Major Banks Supported", isAllBanks: true }],
  },
  {
    category: "Digital Wallets",
    icon: <FaWallet className="w-5 h-5 text-green-600" />,
    methods: [
      {
        name: "Paytm",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png",
      },
      {
        name: "PhonePe",
        logo: "https://res.cloudinary.com/dblgvmpxc/image/upload/v1752573451/phonepe-remove-bg_au8c1i.png",
      },
      {
        name: "Mobikwik",
        logo: "https://res.cloudinary.com/dblgvmpxc/image/upload/v1752573518/mobikwik-removebg-preview_dnsrsp.png",
      },
    ],
  },
  {
    category: "Cash on Delivery",
    icon: <FaMoneyBillWave className="w-5 h-5 text-orange-600" />,
    methods: [
      {
        name: "COD",
        logo: "https://img.icons8.com/color/96/cash-in-hand.png",
      },
    ],
  },
  {
    category: "UPI (Coming Soon)",
    icon: <FaQrcode className="w-5 h-5 text-indigo-600" />,
    methods: [
      {
        name: "UPI Payments",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/512px-UPI-Logo-vector.svg.png",
      },
    ],
  },
];

const PaymentMethods = () => {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-8 max-w-5xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-10 text-center">
        Payment Options
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paymentData.map((section, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-blue-50 via-white to-green-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-2 mb-4">
              {section.icon}
              <h2 className="text-xl font-semibold text-gray-700">
                {section.category}
              </h2>
            </div>

            {section.methods[0]?.isAllBanks ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <FaUniversity className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  All Major Banks Supported
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {section.methods.map((method, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-2">
                      <img
                        src={method.logo}
                        alt={method.name}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-full h-full items-center justify-center text-gray-400 hidden"
                        style={{ display: "none" }}
                      >
                        <FaCreditCard className="w-6 h-6" />
                      </div>
                    </div>
                    {method.comingSoon && (
                      <span className="text-xs text-yellow-600 font-medium mt-1">
                        Coming Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
