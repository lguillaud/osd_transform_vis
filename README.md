*Forked from https://github.com/gwintzer/transform_vis.*

An Opensearch visualization plugin that allows arbitrary queries results to be processed by a [Mustache](https://mustache.github.io/) transform.
You can also call any external JS library to build new visualisations: Google Chart, d3js, ...

* [Variable Binding](#variable-binding)
* [Support for Javascript](#support-for-javascript)
* [Support for CSS](#support-for-css)
* [Query DSL](#query-dsl)
* [Debugging](#debugging)
* [Google Chart Sample](google-chart-sample)

Installation for Openserach Dashboards 1.1.0:

```
bin/opensearch-dashboards-plugin install https://github.com/.../releases/download/1.1.0/transform_vis-1.1.0.zip
```

## Variable Binding

The object passed to the mustache template looks like this:

```
{
  response: { .. } // The Query Response exactly as returned from Elasticsearch
  context: { .. } // The dashboard context (contains filters, query string, time range)
  meta: { .. } // Your Javascript Object
}
```

From mustache, you can access these variables directly.

From the Javascript object, they're available via `this`, e.g., `this.response`

## Support for Javascript

By default, no unsafe HTML (such as `<style>` tags) will be allowed, as processed by Angular's [$sanitize](https://docs.angularjs.org/api/ngSanitize/service/$sanitize) , but Javascript processing can be achieved by acknowledging the client-side security risk in `kibana.yml`. 
Morevover, access to external libraries can also be allowed such as Google Chart for example:

Add the following lines into your `kibana.yml` file: 
```
csp.strict: false
csp.warnLegacyBrowsers: false
csp.rules:
  - "script-src 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com/ https://d3js.org/ https://cdn.jsdelivr.net/ https://cdnjs.cloudflare.com/ https://cdn.datatables.net/ 'self'
  - "worker-src blob: *"
  - "child-src blob: *"
```
   
When enabled, a "Javscript" box appears that allows you to create a special object that will be merged with the query's response object under the field name `meta`.  

`<script>` tags will not be evaluated.  

Any Javascript given will be executed by the web browser, however in order to be merged with the query response object for processing by Mustache, you must prepare an Object, enclosed by parentheses like this:


Multi Query DSL:
```
({
 some_var: 42,
 count_hits: function() {
  return this.response.hits.total;
 }
})
```

Named functions can then be called by mustache, like:

```
<hr>{{meta.count_hits}} total hits<hr>
```

Functions called by mustache are executed before the actual render on the page, so no DOM manipulation can be done.   
The `before_render` and `after_render` lifecycle hooks will be called automatically. The former can be used for any pre-processing that might be required before rendering, and the latter should be used for anything that expects the HTML to be rendered. e.g.:

Javascript:
```
({
  after_render: function() {

    var sampleSVG = d3.select("#viz")
        .append("svg")
        .attr("width", 100)
        .attr("height", 100);    

    sampleSVG.append("circle") 
        .style("stroke", "gray") 
        .style("fill", "white")
        .attr("r", 40)
        .attr("cx", 50)
        .attr("cy", 50)
        .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
        .on("mouseout", function(){d3.select(this).style("fill", "white");});
  }
}) 
```

Template:
```
<div id="viz"> </div>
```


## Support for CSS

`<style>` tags can be embedded in the mustache template.

## Query DSL

`"_DASHBOARD_CONTEXT_"`, including the surrounding quotes, will be replaced by a bool query that represents the filter/search state of the dashboard in context.  
`"_TIME_RANGE_[<date field name>]" ` , including the surrounding quotes, will be replaced by a date range query that represents the date/time filter state of the dashboard in context.

It is allowed to use multiple named queries.

This example is given to demonstrate how the dashboard context can co-exist with your own query clauses, but you are not restricted to this format.

The following code produces multi-level bool statement:

```
{
  	"ordersPerDay": {
   		"index": "opensearch_dashboards_sample_data_ecommerce",
 		"query": {
			"bool": {
   				"must": [
	    			"_DASHBOARD_CONTEXT_",
     				"_TIME_RANGE_[order_date]"
     				.. your must clause(s) can go here ..
   				], 
   				"should": [
	     		.. your should clause(s) can go here ..
   				]
  			}
 		}
	}
```

## Debugging

You can dump the response object to a `<pre>` tag in your visualization output while testing, for convenience.

```
({
 count_hits: function() {
  return this.response.hits.hits.length;
 },
 debug: function() {
  return JSON.stringify(this, null, ' ');
 } 
})
```

Mustache:

```
<hr>
  {{response.hits.total}} total hits<BR>
  {{meta.count_hits}} returned hits<BR>
<hr>

<pre>
{{meta.debug}}
</pre>
```

## Google Chart Sample

Multi Query DSL:
```
{
  "ordersPerDay": {
    "index": "opensearch_dashboards_sample_data_ecommerce",
    "query": {
      "bool": {
        "must": [
          "_DASHBOARD_CONTEXT_",
          "_TIME_RANGE_[order_date]"
        ]
      }
    },
    "aggs": {
      "ordersPerDay": {
        "date_histogram": {
          "field": "order_date",
          "interval": "day"
        }
      }
    }
  }
}
```
 
Javascript:
```
({
    before_render: function() {
      console.log(this.response);
    // Get results
    let orders_per_day = this.response.ordersPerDay.aggregations.ordersPerDay.buckets;
    function last_day_count(orders) {
      // we drop the last bucket as done in Kibana sample and TSVB viz
      return orders[orders.length-2].doc_count;
    }
    // putting what we expect in response eases the following
    response.count = last_day_count(orders_per_day); 
  }, 
    
  after_render: function() {
    //-------------------------------------------------------------------------
    // function to get the location of a CSS selector within a shadow DOM 
    //-------------------------------------------------------------------------
    function getShadowDomLocation(selector) {
      let vizLocation;
      // output-viz being the top selector used by the Transform plugin
      // Get all the output-viz elements (can have mutliple selector if multiple transfrm vizs in a dashboard)
      // selector parameter value must be unque within the DOM
      const elements = $('.output-vis');
      let shadow;
      for (let elem of elements) {
        shadow = elem.shadowRoot;
        vizLocation = $(shadow).find(selector);
        if (vizLocation.length > 0) {
          // selector found, exiting
          break;
        } else {
          vizLocation = '.notFound';
        }
      } 
      const obj = {
      vizLocation: vizLocation,
      shadowRoot: shadow
      }
      // obj object contains the shadowRoot element and and the location of the selector within the shadowRoot
      return obj; 
    }
    
    // Get external JS lib
    $.getScript("https://www.gstatic.com/charts/loader.js").done(function( script, textStatus ) {
      console.log("Import retention js Complete");
      
      // specify where is located your Gauge in the HTML doc
      let gaugeLocation = getShadowDomLocation("#ordersGauge").vizLocation[0]
      // Remove children to avoid multiple graphs
      $(gaugeLocation).empty();

      google.charts.load('current', {'packages':['gauge']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['rate', response.count]
        ]);

        var options = {
          width: 800, height: 240,
          max: 200,
          redColor: '#CD3C14',
          yellowColor: '#FFCC00',
          greenColor: '#32C832',
          redFrom: 0, redTo: 80,
          yellowFrom:80, yellowTo: 120, 
          greenFrom: 120, greenTo: 200,
          minorTicks: 5
        };

        var chart = new google.visualization.Gauge(gaugeLocation);

        chart.draw(data, options);

      }
    });
}
})

```

Template:
```
<style>

.gaugeTitle{
  margin-top: 20px;
  margin-left: 20px;
  color: #F16E00;
  font-weight: bold;
  text-align: left;
  font-size : 20px;
}

</style>



<body>
  <div id="ordersGauge"></div>
  <div class="gaugeTitle">Last Daily Order Rate</div>
</body>
```
