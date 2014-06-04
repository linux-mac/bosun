interface IExprScope extends ng.IScope {
	expr: string;
	error: string;
	running: string;
	result: any;
	queries: any;
	result_type: string;
	set: () => void;
	tab: string;
	graph: any;
	svg_url: string;
	date: string;
	time: string;
	keydown: ($event: any) => void;
}

tsafControllers.controller('ExprCtrl', ['$scope', '$http', '$location', '$route', function($scope: IExprScope, $http: ng.IHttpService, $location: ng.ILocationService, $route: ng.route.IRouteService) {
	var search = $location.search();
	var current: string;
	try {
		current = atob(search.expr);
	}
	catch (e) {
		current = '';
	}
	if (!current) {
		$location.search('expr', btoa('avg(q("avg:rate:os.cpu{host=ny-devtsaf01}", "5m", "")) > 80'));
		return;
	}
	$scope.date = search.date || '';
	$scope.time = search.time || '';
	$scope.expr = current;
	$scope.running = current;
	$scope.tab = 'results';
	$http.get('/api/expr?q=' +
		encodeURIComponent(current) +
		'&date=' + encodeURIComponent($scope.date) +
		'&time=' + encodeURIComponent($scope.time))
		.success((data) => {
			$scope.result = data.Results;
			$scope.queries = data.Queries;
			$scope.result_type = data.Type;
			if (data.Type == 'series') {
				$scope.svg_url = '/api/egraph/' + btoa(current) + '.svg?now=' + Math.floor(Date.now() / 1000);
				$scope.graph = toRickshaw(data.Results);
			}
			$scope.running = '';
		})
		.error((error) => {
			$scope.error = error;
			$scope.running = '';
		});
	$scope.set = () => {
		$location.search('expr', btoa($scope.expr));
		if (typeof $scope.date == 'object') {
			$scope.date = moment($scope.date).utc().format('YYYY-MM-DD');
		}
		$location.search('date', $scope.date || null);
		$location.search('time', $scope.time || null);
		$route.reload();
	};
	function toRickshaw(res: any) {
		var graph: any = [];
		angular.forEach(res, (d, idx) => {
			var data: any = [];
			angular.forEach(d.Value, (val, ts) => {
				data.push({
					x: +ts,
					y: val,
				});
			});
			if (data.length == 0) {
				return;
			}
			var name = '{';
			angular.forEach(d.Group, (tagv, tagk) => {
				if (name.length > 1) {
					name += ',';
				}
				name += tagk + '=' + tagv;
			});
			name += '}';
			var series = {
				data: data,
				name: name,
			};
			graph[idx] = series;
		});
		return graph;
	}
	$scope.keydown = function($event: any) {
		if ($event.keyCode == 13) {
			$scope.set();
		}
	}
}]);