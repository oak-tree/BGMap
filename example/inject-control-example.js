	/**
			 * show big map on screen.. TODO get input to last map position and
			 * filer(s)...
			 */
			map : function() {

				var coordinate = {
					latitude : 31,
					longitude : 35
				};

				var point = new google.maps.LatLng(coordinate.latitude,
						coordinate.longitude);

				var mapModel = new Map({
					center : point,
					width : '100%',
					height : '1000px',
				});
				var mapView = new MapView({
					model : mapModel
				});
				mapView.render();
				mapView.on("mapIsReady", function(event) {
					console.log('map is ready event has been capture');

					var MapControllerViewFullscreen = MapControllerView
							.extend({
								
								mapEvents : {

									'click strong' : 'click',
								},
								click : function() {
									console.log('fullscreenmode');
								}
							});
					newController = new MapControllerViewFullscreen({
						title : "full screen"
					});

					newController.injectIntoMap({
						map : mapView.map
					});

					var MapControllerTreeView = MapControllerView.extend({
						
						itemTemplate: _.template('<li id="<%=id%>" class="list-group-item" color="<%=color%>"><%= name %></li>'),
						collection:null,
						idCounter:0,
						editViews:[],
						mapEvents : {

							'click li':'layerClick',
							'click .btn.add-layer' : 'add',
							
							
						},
						events: {
							".click .add":"add",
							
							
						},
						
						layerClick:function(event){
							console.log($(event.target).attr('id'));
							var id =  parseInt($(event.target).attr('id'),10) || 0;
							
							/* tell layer user click on it */
							this.collection.findWhere({id:id}).trigger('layer:click'); 
						},
						
						add:function(event){
							console.log('add event from btn');
							this.idCounter = this.idCounter + 1; 
							var model = new Backbone.Model({name:'new layer ' + this.idCounter ,color:'red',id:this.idCounter});
							if (!this.collection)
								this.collection = new Backbone.Collection();
							
							this.collection.push(model);
							 var searchView = SearchFactory.createAdvanceSearchForPlaces(null,this.idCounter);
							 this.editViews.push(searchView);
//							var searchCollection = new Backbone.Collection();
							var view = new MarkersLayer({model:model,collection:searchView.searchManager.getSearchCategory(),editView:searchView,map:this.map});
							this.$el.find('.layers.list-group').append(this.itemTemplate(model.toJSON()));

							/* add new controller. update event */
							this.delegateMapEvents(); 		   
						},
						
						finishedRender1 : function() {

							// dbItemTypeAhead.makeElementTypeAhead(args);
							console.log("finish render1 ");
						},

						click : function() {
							console.log('treeview');
						},
					});

					var tmArgs = {
						msgWhenDone : true
					};

					treeController = new MapControllerTreeView({
						title : "full screen",
						template : "Map/GISLayersControlView",
						
					});

					TemplateManager.setTMHook({
						tmArgs : tmArgs,
						callback : function() {
							treeController.finishedRender1();
						},
					});

					treeController.injectIntoMap({
						map : mapView.map,
						position : google.maps.ControlPosition.RIGHT_CENTER,
						tmArgs : tmArgs
					});

					google.maps.event.trigger(mapView.map, 'resize');
					center = mapView.map.getCenter();
					mapView.map.setCenter(center);
					google.maps.event.trigger(mapView.map, 'resize');

				}, this);

				// $("#map").css("position", 'fixed').
				// css('top', 0).
				// css('left', 0).
				// css("width", '100%').
				// css("height", '100%');
				google.maps.event.trigger(mapView.map, 'resize');
				$('#content').html(mapView.el);
			},