var coinApp = angular.module('coinApp', []);


(function () {
    'use strict';

    angular
        .module('coinApp')
        .controller('kpremiumController', kpremiumController);

    kpremiumController.$inject = ['$scope', '$http', '$interval'];
    function kpremiumController($scope, $http, $interval) {
		$scope.coinone = {};
		$scope.poloniex = {};
		$scope.poloniex_usdt = {};
		$scope.bithumb = {};
		$scope.last_update = "";
		function getCoinonePrice(currency){
			var url = 'https://api.coinone.co.kr/ticker/?format=json&currency=' + currency.toLowerCase();
			$http.get(url).then(
				function(response)
				{
					$scope.coinone[currency] = response.data.last;
				});
		}

		function getUSDRate(){
			var proxy_url = "https://galvanize-cors-proxy.herokuapp.com/"
			var suburl = 'https://api.manana.kr/exchange/rate/KRW/USD.json'
			var url = proxy_url + suburl;
			$http.get(url).then(
				function(response)
				{
					console.log(response.data[0]);
					$scope.krw_usd = response.data[0].rate;
				});
		}
		
		
		function getPoloniexPriceUSDT(currency){
			var url = "https://poloniex.com/public?command=returnTradeHistory&currencyPair=USDT_" + currency.toUpperCase();
			
			$http.get(url).then(
				function(response)
				{
					$scope.poloniex_usdt[currency] = response.data[0].rate;
				});
		}
		
		function getPoloniexPrice(currency){
			var url = "https://poloniex.com/public?command=returnTradeHistory&currencyPair=BTC_" + currency.toUpperCase();
			
			$http.get(url).then(
				function(response)
				{
					$scope.poloniex[currency] = response.data[0].rate;
				});
		}
		
		function getBithumbPrice(currency){
			var proxy_url = "https://galvanize-cors-proxy.herokuapp.com/"
			var suburl = "https://api.bithumb.com/public/ticker/" + currency.toUpperCase() + "/"
			var url = proxy_url + suburl;
			$http.get(url).then(
				function(response)
				{
					$scope.bithumb[currency] = response.data.data.closing_price;
				});
			
		}
		
		$scope.currency_types = ["btc", 'eth', 'etc', 'xrp'];
		$scope.fee = {
			"btc": 0.0005,
			"eth": 0.01,
			"etc": 0.01,
			"xrp": 0.01,
			"ltc": 0.01,
			"dash": 0.01,
		};
		
		$scope.sellAtPoloniex = function(currency){
			var coin_after_transfer = 1000000 / $scope.bithumb[currency] - $scope.fee[currency];
			return coin_after_transfer * $scope.poloniex[currency] * (1 - 0.0015);
		}
		
		
		$scope.sellAtPoloniexEx = function(currency, retCurrency){
			var coin_after_transfer = 1000000 / $scope.bithumb[currency] - $scope.fee[currency];
			if(currency != 'btc')
				var btc = coin_after_transfer * $scope.poloniex[currency] * (1 - 0.0015);
			else
				var btc = coin_after_transfer;
			var ret_coin = btc / $scope.poloniex[retCurrency] * (1 - 0.0015);
			return ret_coin;
		}
		
		$scope.btcPriceAtCoinone = function(amount){
			return amount * $scope.coinone['btc'];
		}

		$scope.gainEx = function(currency, retCurrency){
			var coinAtPoloniex = $scope.sellAtPoloniexEx(currency, retCurrency);
			var afterValue = $scope.bithumb[retCurrency] * coinAtPoloniex;
			var diff = afterValue - 1000000;
			var percentage = diff / 1000000 * 100;
			return percentage;
		}
		
		$scope.gain = function(currency){
			var coinAtPoloniex = $scope.sellAtPoloniex(currency);
			var afterValue = $scope.btcPriceAtCoinone(coinAtPoloniex);
			var diff = afterValue - 1000000;
			var percentage = diff / 1000000 * 100;
			return percentage;
		}

		$scope.gainColor = function(currency, retCurrency){
			var gain_p = $scope.gainEx(currency, retCurrency);
			if(gain_p > 5)
				return "sucess";
			if(gain_p > 1.8)
				return "info";
		}
		
		$scope.poloniex_currency = ['eth', 'etc', 'xrp', 'ltc', 'dash'];
		
		
		$scope.bithumb_currency = ["btc", 'eth', 'etc', 'xrp', 'ltc', 'dash'];
		
		$scope.premium = function(market, currency){
			var price = 0.000001;
			if(market =='coinone')
				price = $scope.coinone[currency];
			if(market =='bithumb')
				price = $scope.bithumb[currency];
			var diff = price - $scope.poloniex_usdt[currency] * $scope.krw_usd * 1.00;
			var p = 100 * diff / price;
			return p;
		}

		$scope.colorByPremium = function(market, currency){
			var p = $scope.premium(market, currency);
			if(p > 10)
				return "danger";
			if(p > 7)
				return "warning";
			if(p > 2.5) 
				return "info";
			if(p > -2.5)
				return "";
			if(p > -7)
				return "success";
			if(p > -10)
				return "green1";
			if(p > -18)
				return "green2";
			if(p < -18)
				return "green3";
			return "";
		}

		$scope.getChartUrl = function(market, currency, base){
			var prefix = "https://cryptowat.ch/";
			var url = prefix + market + "/"+  currency + base;
			return url;
		}


		function load_data(){
			getUSDRate();
			angular.forEach($scope.currency_types, getCoinonePrice);
			angular.forEach($scope.poloniex_currency, getPoloniexPrice);
			angular.forEach($scope.bithumb_currency, getPoloniexPriceUSDT);
			angular.forEach($scope.bithumb_currency, getBithumbPrice);
			$scope.last_update = new Date();
		}
		console.log("debuggin..");
		load_data();


		var stopTime = $interval(load_data, 60000);

	}

})(window.angular);
