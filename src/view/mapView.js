window.mapUtils = {
	geocoder : new google.maps.Geocoder(),

	getCoordinateByModelName : function(model) {
		console.log('get coordinate by name' + model.get('name'));
		// var url = this.parentType + '/' + this.parentId + '/' +
		// this.innerObjectType + 's' + '/add/' + innerObjectId
		var that = this;
		var url = 'http://maps.googleapis.com/maps/api/geocode/json?address='
				+ model.get('name') + '&sensor=true'
		settings = {
			success : function(data) {
				if (data.results.length == 0) {

					utils.showAlert('no result',
							'google service returns zero result for '
									+ model.get('name'), 'alert-success');
					return;

				}

				utils.showAlert('Success!', 'found coordinate for '
						+ data.results[0].formatted_address + ' successfully',
						'alert-success');

				var coordinate = {
					coordinate : {
						latitude : data.results[0].geometry.location.lat,
						longitude : data.results[0].geometry.location.lng
					}
				}

				model.set(coordinate)
			},
			error : function() {
				utils.showAlert('Error',
						'couldnt get data from google service', 'alert-error')
			}
		}

		// var url = "keyword/" + this.id + "/superKeywords/add/" +
		// superId
		// console.log('add relation between ' + this.parentId + ' and '
		// +
		// innerObjectId);
		var self = this;
		var mustSettings = {
			url : url,
			dataType : "json",
			type : "GET"
		}
		$.extend(settings, mustSettings)

		$.ajax(settings);

		return;
	},

}
window.Map = Backbone.Model.extend({

	defaults : {
		zoom : 1,
		center : new google.maps.LatLng(31, 35),
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		width : "700px",
		height : "480px"

	}

});

window.MapItemData = Backbone.Model.extend({

	defaults : {
		id : 1,
		hebrewName : "חלמית קטנת-פרחים",
		ezor : "שר",
		locality : "הרצליה הצעירה",
		prihaBlooming : "3",
		alvaLv : "4",
		priFruit : "2",
		collector : "מנדלסון עמית",
		day : "01",
		month : "04",
		date : 575848800000,
		orech : 1360,
		rohav : 1735,

	}
});
/**
this is a basic view for easy creation of dom elements on google map . this view use the idea of backbone view of hashtable to bind map event


*/

window.MapDomElementView = BasicView.extend({

	mapEvents : {

		'click .btn' : 'clickOnButton',
	},
	delegateEventSplitter : /^(\S+)\s*(.*)$/,
	mapEventsListerner : [],

	/**
	 * clear all controller map listeners
	 */
	clearMapListerners : function() {
		for ( var l in this.mapEventsListerner)
			google.maps.event.removeListener( this.mapEventsListerner[l]);

		// reset the array
		this.mapEventsListerner = [];

	},

	/**
	 * add new map listener
	 */
	addMapListeners : function(el, eventName, method) {

		this.mapEventsListerner.push(google.maps.event.addDomListener(el,
				eventName, method));
	},

	delegateMapEvents : function(events) {
		if (!(events || (events = _.result(this, 'mapEvents'))))
			return this;
		this.clearMapListerners();
		// this.undelegateEvents();
		var delegateEventSplitter = this.delegateEventSplitter;

		for ( var key in events) {
			var method = events[key];
			if (!_.isFunction(method))
				method = this[events[key]];
			if (!method)
				continue;

			var match = key.match(delegateEventSplitter);
			var eventName = match[1], selector = match[2];
			method = _.bind(method, this);
			// eventName += '.delegateEvents' + this.cid;
			if (selector === '') {
				this.addMapListeners(this.el, eventName, method);
			} else {

				els = this.$el.find(selector).get()
				if (els != null) {
					/* make sure to map this event to all relevent item */
					for (var el in els)
						this.addMapListeners(els[el], eventName, method);
					
				}

			}
		}
		return this;
	},
	
	
	createMarker:function(options){
		return new google.maps.Marker(options);
		
	
	},
	
	createInfoWindow:function(options){
		return new google.maps.InfoWindow(options);
	},
	
	
	/**
	 * make sure to clean dom map listener before removing the view 
	 */
	remove:function(){
		
		this.delegateMapEvents();
		MapDomElementView.__super__.remove.call(this);
		
	},
});
window.MapControllerView = MapDomElementView.extend({

	tagName : "div", // Not required since 'div' is the default if no
	template : "Map/MapControllerView",
	title : "home",

	initialize : function(options) {
		BasicView.prototype.initialize.apply(this, arguments);
		this.title = options.title || this.title;
		// this.template = this.options.template;
	},

	events : {
		'click .btn' : 'clickOnButton',
	},

	/**
	 * 'click' 'dblclick' 'mouseup' 'mousedown' 'mouseover' 'mouseout' 'click'
	 * 'dblclick' 'mouseup' 'mousedown' 'mouseover' 'mouseout'
	 * 
	 */




	clickOnButton : function(events) {
		console.log('yeah- clikc on button');
	},
	/**
	 * option - args.randomId option - args.callback
	 */
	render : function(args) {
		var that = this;
		TemplateManager.get(this.template, function(template, tmArgs) {

			that.$el.html(template({
				title : that.title
			}));

			/* pass tMargs to extra call with ajax to keep the chain */
			that.trigger('view:render-end');
		}, args);
		return this;
	},

	click : function(map) {
		alert('controller has been clicked');
	},

	/**
	 * args.map the map to inject into args.position google.maps.ControlPosition
	 * property if none. use TOP_RIGHT
	 * 
	 */
	injectIntoMap : function(args) {
		var self = this;

		var position = args.position || google.maps.ControlPosition.TOP_RIGHT;
		var map = args.map;
		this.map = map;
		var tmArgs = args.tmArgs || null;

		this.on('view:render-end', function() {
			console.log('finsied rendering controller');
			map.controls[position].push(self.el);
			this.delegateMapEvents();
		});

		this.render();
		// map.controls[position].push(self.render(tmArgs).el);
		// google.maps.event.addDomListener(self.el, 'click', function() {
		// console.log('fullscreen has been click');
		// self.click(map);
		// });

		// this.delegateEvents();
	},

//	
// setEventsOnMap:function(events){
// var that = this;
// for (var e in mapEvents){
// google.maps.event.addDomListener(self.el, 'click', function() {
// console.log('fullscreen has been click');
// self.click(map);
// });
// }

});

window.MapItems = Backbone.Collection.extend({
	mode : MapItemData,

});

window.MapItemView = BasicView.extend({

	tagName : "div", // Not required since 'div' is the default if no
	template : "Map/MapItemView",
	initialize : function() {
		BasicView.prototype.initialize.apply(this, arguments);
		this.model.bind("change", this.render, this);
		// this.template = this.options.template;
	},

});
var currentMap; // should be change to tigger and events

//TODO change map view to use MapDomElementView
window.MapView = BasicView
		.extend({
			id : 'map',
			tagName : "div", // Not required since 'div' is the default if no
			template : "Map/MapView",
			mapReady : false,
			markers : [], // holds all the current markers in map

			initialize : function(options) {
				if (options == null)
					return;
				if (options.template == null)
					return;
				this.template = options.template;

				/* make sure to draw new markers each fetch from db */
				// this.model.bind("reset", this.drawMarkers, this);
				// pageableKeywords.bind("change", this.drawMarkers, this);
				// pageableKeywords.bind("reset",function(){
				// console.log("chnage");}
				// );
			},

			preRender : function() {

			},
			getMap : function() {
				return this.map;
			},

			renderMap : function(that) {

				var domElement = that.$('#googleMap');

				that.map = new google.maps.Map(domElement.get(0),
						that.model.attributes);
				currentMap = that.map;
				currentMap.setZoom(5);
				var a = google.maps.event.addListener(that.map, "idle",
						function() {
							that.map.setCenter(that.model.get("center"));
							google.maps.event.trigger(that.map, 'resize');
							that.map.setCenter(that.model.get("center"));
							google.maps.event.removeListener(a);
							that.trigger("mapIsReady");
							that.mapReady = true;
						});
			},
			render : function() {
				var that = this;
				TemplateManager.get(this.template, function(template) {

					that.$el.html(template(that.model.toJSON()));
					//
					/*
					 * TODO - should check if there was a rendering or not....
					 * there is no need to recreate map all over again?
					 */
					that.renderMap(that);

				});
				return this;
			},

			drawMarkers : function(args) {
				console.log("draw markers");
				this.clearOverlays;
				/*
				 * args.map - map of google map args.markers - collection of
				 * backbone
				 */
				var lastMarker;
				_.each(args.models, function(data) {

					/*
					 * get next item on list
					 */

					lastMarker = this.drawMarker(this.map, data);

				}, this);

				currentMap.setZoom(9);
				var googleLatLan = lastMarker.getPosition();
				console.log("lng " + googleLatLan.lng());
				console.log("lat " + googleLatLan.lat());
				currentMap.setZoom(13);
				currentMap.setCenter(googleLatLan);
				return this;

			},

			// Sets the map on all markers in the array.
			setAllMap : function(map) {
				for (var i = 0; i < markers.length; i++) {
					markers[i].setMap(map);
				}
			},
			// Removes the overlays from the map, but keeps them in the array.
			clearOverlays : function() {
				setAllMap(null);
			},

			// Shows any overlays currently in the array.
			showOverlays : function() {
				setAllMap(map);
			},

			// Deletes all markers in the array by removing references to them.
			deleteOverlays : function() {
				clearOverlays();
				this.markers = [];
			},

			getLanlngUtm : function(model) {
				latlon = new Array(2);
				var x, y, zone, southhemi;
				x = model.rohav * 1000;
				y = model.orech * 1000;
				// orech : 1360,
				// rohav : 1735,
				zone = 36;
				southhemi = false;
				UTMXYToLatLon(x, y, zone, southhemi, latlon);
				console.log('x ' + x + " tranform into " + RadToDeg(latlon[0]));
				console.log('y ' + y + " tranform into " + RadToDeg(latlon[1]));
				return new google.maps.LatLng(RadToDeg(latlon[0]),
						RadToDeg(latlon[1]));
			},

			getLanLngOld : function(model) {

				y = model.get("rohav");
				x = model.get("orech");

				var latLat = convertToGpsRef(x, y);

				return new google.maps.LatLng(latLat.lat, latLat.lng);

			},
			getLanLng : function(model) {

				return new google.maps.LatLng(model.get("coordinate").latitude,
						model.get("coordinate").longitude);

			},

			drawMarker : function(map, model) {

		
				var myLatlng = this.getLanLng(model);
		
				var contentString = new 	({
					model : model
				}).render().el;

				var marker = new google.maps.Marker({
					position : myLatlng,
					map : map,
					title : model.get("name"),
					draggable : true,
					animation : google.maps.Animation.DROP,
				});

				var infowindow = new google.maps.InfoWindow({
					content : contentString,
					maxWidth : 200
				});
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map, marker);
				});
				this.markers.push(marker);
				return marker;
			},

			close : function() {
				$(this.el).unbind();
				$(this.el).empty();
			}

		});
