/**
 * accept any model that has coordinates field
 */
var MapLayerItemView = MapDomElementView.extend({

	tagName : "div", // Not required since 'div' is the default if no
	template : "Map/MapItemView",
	
	
	mapEvents : {

		'mouseover' : 'mouseHover',
		'click':'openInfoWindow',
	},
	
	mouseHover:function(){
		
		console.log('got mouse over on layer item view ');
	},
	
	initialize : function(options) {
		BasicView.prototype.initialize.apply(this, arguments);		
		this.map = options.map || {};
		
	

		this.model.on("change", this.render, this);
		this.model.on("item:remove", this.remove, this);
		this.model.on("item:setColor", this.setColor, this);
		this.model.on("item:setIcon", this.setIcon, this);
		this.model.on("item:setIconHover", this.setIconHover, this);
		
		

		if (this.map === {}) 
			return
	
		
		
	},
	
	
	remove:function(map,param){
	   this.marker.setMap(null);
	},
	
	setColor:function(map,param){
	  this.marker.setIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|' + param.color);
	},
	
	setIconHover:function(map,param){
	    
	    /*call map 
	    . bind hover event.
	    and set the icon to be on this event 
	    */
	    
	},
	
	
	paint:function(map,param) {

		this.map = map; /* allow to put null to maps */
		
		
		var position = new google.maps.LatLng(this.model
				.get("coordinate").latitude, this.model
				.get("coordinate").longitude);

	   this.marker = this.createMarker({
	          map: map,
	          position: position,
	          animation: google.maps.Animation.DROP,
//	          icon : 'img/buildings_32x32.png',
	          title: this.model.get('name'),
	          descr : this.model.get('description'),
	          id : this.model.get(''),
	          draggable:false,
	      });
	  
      this.setInfoWindow(map,param);
		

	},
	
	/**
	 * open info window from click event on marker
	 */
	openInfoWindow:function(){
		//this is the marker it self and not the instance of this class.... we got click on the marker event.
		infowindow.open(this.getMap(),this);
	},
	
	/**
	 * create the info window of a marker
	 */
	setInfoWindow:function(map,param){
		
		var contentString = new MapItemView({
			model : this.model
		}).render().el;

		
		var infowindow = new google.maps.InfoWindow({
			content : contentString,
			maxWidth : 200
		});
		
		
		
		
	},
	
	
	
	_setupMarker:function(){
		if (this.map === {}) 
			return;
		
		
		
	},
	
	
	

});

var InterfaceMapLayer = Backbone.View.extend({
   
    paint: function(){
        throw new Error("Not Implmeneted, Public interafce."); 
    },
    
    injectInto:function(map,param){
        //NOT SURE , is it part of the interface? 
    },
    
    visible:function(map,param){
          throw new Error("Not Implmeneted, Public interafce."); 
    },
    
    hide:function(map,param){
          throw new Error("Not Implmeneted, Public interafce."); 
    },
    
    
    destory:function(map,param){
          throw new Error("Not Implmeneted, APublic interafce."); 
    },
    
});

/**
 * implemnetion of markers layers.
 * 
 */
var MarkersLayer = InterfaceMapLayer.extend({

	template:"map/GISLayerView",
	model:null, /* create model for layer. name/color */
	name: 'layer name',
	Marker:MapLayerItemView,
    /* the thing is the collection and markers must be together. cause there are situation were
    searching markers by model paramerters..
    
    ok - eack marker is a view. and each view bind his model. when acting on the model
    trigger an event related to it. i.e user want to hide all item when name "balhblah"
     
     for model in  collection.filter({name:"balhblah"}) {
             model.trigger(item:hide);
    */
    
  //  markers:[],
    collection:null,
    markers:[], // keep marker view to prevent grabge collector to work
    
    initialize : function(options) {

    	this.map = options.map || {};// if no map is given . we wont draw our markers.
		
    	if (!options.collection)
    		throw "must have a collection to bind on";
    	if (!options.editView)
    		throw "must have an edit view";
    	/* note that this in view and this in event of controler can be diffrent */
    	this.model = options.model || new Backbone.Model({name:'new layer',color:'red'});
    	this.Marker = options.marker || this.Marker;
    	this.model.on('destroy',this._destory,this); /* kill this view if model is destory */
    	this.model.on('change:name',this._updateLayerName,this);
    	this.model.on('change:color',this._updateLayerColor,this);
    	this.model.on('layer:click',this.edit,this);
    	this.collection = options.collection;
		this.name = options.name || this.name;
    	
    	this.editView = options.editView;
    	/*make sure our edit view is rendered ... 
    	 * 
    	 * 
    	 * to think to to restore an map layered view from url
    	 * 
    	 * 
    	 * */
    	
    	this.renderEdit();
    	   	 
    	
			/* make sure to draw new markers each fetch from db */
		this.collection.on("reset", this.paint, this);
		this.collection.on("add", this._add, this);
		this.collection.on("remove", this._remove, this);
		this.on('view:render-done',this.renderEdit,this);
		// pageableKeywords.bind("change", this.drawMarkers, this);
		// pageableKeywords.bind("reset",function(){
		// console.log("chnage");}
		// );
	},
	
	
	_updateLayerName:function(event,name){
		
	},
	
	_updateLayerColor:function(event,color){
		
	},
	
	render : function() {
		var that = this;
		TemplateManager.get(this.template, function(template) {
			if ( typeof that.model == 'undefined' ) 
				that.$el.html(template());
			else
				that.$el.html(template(that.model.toJSON()));
			
			$el.find('#color1').colorPicker();
			that.trigger('view:render-done');
		});

		return this;
	},

	renderEdit:function(){
		/* inject editView into popup */

		 this.editView.render();
//		this.$el.find('.edit-layer').html(this.editView.render().el);
		
		
	},
	edit:function(){
		/* popup the injected edit view */
//		this.editView.$el.fadeIn('slow');


		
		$('.fade-in-controller > .title ').on('remove',function(event){
			console.log('catch remove event');
			event.preventDefault();
		});
		
		
		$('.fade-in-controller > .title ').html('<h3> edit of ' + this.model.get('name') + '</h3>');
		$('.fade-in-controller > .content').append(this.editView.$el)
		$('.fade-in-controller > .content').find('#' + this.model.get('id') ).show();
		$('.fade-in-controller > .content > :not(#' + this.model.get('id') +')').hide();
//		if (this.editView.onShow()){
//			this.editView.onShow();
//		}
		this.editView.delegateEvents();
		$('.fade-in-controller').fadeIn('slow')
//		this.editView.resetTagit(function () { 
//		});;

	},
	
	
	/*
	 * by model
	 * 
	 * assume this model add to collection allready...
	 */
	_add:function(model,param){
		
		
		marker = new this.Marker({model:model});
		marker.paint(this.map,param);
		this.markers.push(marker);
	},
	
	/*
	 * by model 
	 */
	add:function(model) {
		
		if (!this.collection.contains(model) )
			this.collection.add(model);
			 
		
	},
	
	/**
	 * by model
	 */
	_remove:function(marker){
		this._msgMarkers([marker],{msg:"remove"});
		//better... bind the marker event 
		var i = this.markers.length;
		    while(i--){
		    	if	(_.isEqual(marker,this.markers[i].model)){
					   this.markers.splice(i,1);
		       }
		    }
		
	},
	
	
	
    paint: function(map,param){ 
           //creates points on the map by using data
        this.collection.each(function(model){
        	marker = new this.Marker(model);
        	marker.paint(map,param);
            this.markers.push(marker); /* keep record of this marker */
        },this);
    },
    
  
    
    /**
     *  map to render on. params.color
     * here you can set all  marker colors at one time
     */
     
    setColor:function(map,param){
        this._msgAllMarkers({msg:"setColor",map:map,args:param});    
    },
    
    /**
     *
     * set all markers to be with the same icon
     * map to render on. params.icon 
     * 
     * s
     */
      
    setIcon:function(map,param){
          this._msgAllMarkers({msg:"setIcon",map:map,args:param});
    },
    
    
    setIconHover:function(map,param){
        this._msgAllMarkers({msg:"setIconHover",map:map,args:param});
    },
    _msgAllMarkers:function(param){
        this._msgMarkers(this.collection,param) ;
    },
    
    _msgMarkers:function (markers,param){
      for(var p in markers)
        markers[p].trigger("item:" + param.msg,param.args);
        
    },
});



