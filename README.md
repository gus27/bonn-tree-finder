Things done for faster rendering:
- split up the 60.000+ data file in one JSON file per district
- use MarkerClusterer 
- use a lazy list component which renders max. 20 entries at first. Only when scrolling to the last element the next 20 elements are displayed.


I used an KO observable to show and hide the sidebar. This observable
is triggered by the button with the hamburger icon and by the 
$(window).resize event. For window widths greater 600px the sidebar 
will show automatically. I did not use a CSS media query to enable the
user to hide/show the sidebar even when the window widths is greater 600px.

Sources:
https://github.com/yeoman/generator-webapp
https://getbootstrap.com/
https://startbootstrap.com/template-overviews/simple-sidebar/
FontAwesome
http://jsfiddle.net/adrienne/Y2WUN/ (Lazy loading list with KnockoutJS/Infinite scroll)
https://discussions.udacity.com/t/knockout-binding-from-infowindow/189235/12 (InfoWindow with Knockout)
http://jsfiddle.net/SittingFox/nr8tr5oo/ (InfoWindow with Knockout)
