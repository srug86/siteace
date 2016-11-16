currentWebsiteId = undefined;

/// routing 

Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
	this.render('navbar', {
		to:"navbar"
	});
	this.render('main_view', {
		to:"main"
	});
});

Router.route('/:_id', function () {
	this.render('navbar', {
		to:"navbar"
	});
	this.render('detailed_view', {
		to:"main", 
		data:function(){
			currentWebsiteId = this.params._id;
			return Websites.findOne({_id:currentWebsiteId});
		}
	});
});

/// infiniscroll

Session.set("websLimit", 8);
lastScrollTop = 0; 
$(window).scroll(function(event){
	// test if we are near the bottom of the window
	if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
		// where are we in the page? 
		var scrollTop = $(this).scrollTop();
		// test if we are going down
		if (scrollTop > lastScrollTop){
			// yes we are heading down...
			Session.set("websLimit", Session.get("websLimit") + 4);
		}
		lastScrollTop = scrollTop;
	}
})

/// accounts config

Accounts.ui.config({
	passwordSignupFields: "USERNAME_AND_EMAIL"
});

/// 

/////
// template helpers 
/////

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
		return Websites.find({}, {sort:{positives:-1}, limit:Session.get("websLimit")});
	}
});

/////
// template events 
/////

Template.website_item.events({
	"click .js-upvote":function(event){
		increaseLikes(event,this);
		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){
		increaseDislikes(event,this)
		return false;// prevent the button from reloading the page
	}
});

Template.website_form.events({
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	}, 
	"submit .js-save-website-form":function(event){
		// here is an example of how to get the url out of the form:
		var url = event.target.url.value;
		var title = event.target.title.value;
		var description = event.target.description.value;
		console.log("The url they entered is: "+url);
		console.log("The title they entered is: "+title);
		console.log("The description they entered is: "+description)
		if (Meteor.user()){
			Websites.insert({
				title:title, 
				url:url, 
				description:description,
				keywords:"",
				positives:0,
				negatives:0,
				createdOn:new Date(),
				createdBy:Meteor.user()._id
			});
		}
		return false;// stop the form submit from reloading the page
	}
});

Template.website_detail.events({
	"click .js-upvote":function(event){
		increaseLikes(event,this);
		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){
		increaseDislikes(event,this)
		return false;// prevent the button from reloading the page
	}
});

Template.comment_form.events({
	"click .js-toggle-website-form":function(event){
		$("#comment_form").toggle('slow');
	}, 
	"submit .js-save-website-form":function(event){
		if (Meteor.user()) {
			var userName = Meteor.user().username;
			var content = event.target.content.value;
			if (currentWebsiteId != undefined) {
				Websites.update({_id:currentWebsiteId},
				{$push:{comments:{
					$each:[{
						author:userName,
						content:content,
						createdOn:new Date()
					}],
					$sort:{createdOn:-1}
				}}});
			}
		}
		return false;// stop the form submit from reloading the page
	}
});

function increaseLikes(event,website){
	// example of how you can access the id for the website in the database
	// (this is the data context for the template)
	var website_id = website._id;
	console.log("Up voting website with id "+website_id);
	Websites.update({_id:website_id}, {$inc: {positives:1}});
}

function increaseDislikes(event,website){
	// example of how you can access the id for the website in the database
	// (this is the data context for the template)
	var website_id = website._id;
	console.log("Down voting website with id "+website_id);
	Websites.update({_id:website_id}, {$inc: {negatives:1}});
}
