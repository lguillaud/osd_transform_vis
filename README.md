> Forked (ported) from https://github.com/gwintzer/transform_vis and https://github.com/bjacomy/transform_vis* - Special thanks to these contributors who kept and are still keeping this plugin working for all Kibana versions.

An Opensearch visualization plugin that allows arbitrary queries results to be processed by a [Mustache](https://mustache.github.io/) transform.
You can also call any external JS library to build new visualisations: Google Chart, d3js, ...

* [Prerequisites](#prerequisistes)
* [Installation](#installation)
* [Plugin presentation](#plugin-presentation)
* [Visualisation samples](#visualisation-samples)

## Prerequisites

### OpenSearch Dashboards

#### Client side

On the OpenSearch Dashboards client side (**Stack Management > Advanced Settings**), enable the `state:storeInSessionStorage` option in order to avoid the following error message: *"The URL for this object is too long, and we can't display it"*.

#### Server side

By default, no unsafe HTML (such as `<style>` tags) will be allowed, but Javascript processing can be achieved by acknowledging the client-side security risk in `opensearch_dashboards.yml`. 
Morevover, access to external libraries can also be allowed by adding the required root URLs in the configuration (the list given below is not exhaustive). 

Add the following lines into your `opensearch_dashboards.yml` file: 

```sh
# server.cors: true is normally the default value but required in case you you need to access Opensearch from JS code (e.g. XHR requests) along with the opensearch configuration next section.
server.cors: true

csp.strict: false
csp.warnLegacyBrowsers: false
csp.rules:
  - "script-src 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com/ https://d3js.org/ https://cdn.jsdelivr.net/ https://cdnjs.cloudflare.com/ https://cdn.datatables.net/ 'self'
  - "worker-src blob: *"
  - "child-src blob: *"
```

### OpenSearch (optional)

The configuration for Opensearch (server side) in only required in case you need to access Opensearch from JS code (e.g. XHR requests).

Add the following lines into your `opensearch.yml` file:

```sh
http.cors.enabled : true
http.cors.allow-origin: "*"
http.cors.allow-methods : OPTIONS, HEAD, GET, POST, PUT, DELETE
http.cors.allow-headers: "kbn-version, Origin, X-Requested-With, Content-Type, Accept, Engaged-Auth-Token Authorization"
```

## Installation

The installation command is given for version `1.1.0`:

```sh
bin/opensearch-dashboards-plugin install https://github.com/lguillaud/osd_transform_vis/releases/download/1.1.0/transformVis-1.1.0.zip
```

By running this command, a new visualization `transform` will be available when using the Visualize module in OpenSearch Dashboards.

## Plugin presentation
The plugin is split into 2 parts:
* a development window with 3 different tabs: Multi Query DSL, Javascript and Template
* a visualisation window

### Basic usage

The object passed to the mustache template looks like this:

```sh
{
  response: { .. } // The Query Response exactly as returned from OpenSearch
  context: { .. } // The dashboard context (contains filters, query string, time range)
  meta: { .. } // Your Javascript Object
}
```

From mustache, you can access these variables directly.
From the Javascript object, they are available via `this`, e.g., `this.response`
`<script>` tags will not be evaluated.  

Any Javascript given will be executed by the web browser, however in order to be merged with the query response object for processing by Mustache, you must prepare an Object, enclosed by parentheses like this:

**Javascript**
```sh
({
 some_var: 42,
 count_hits: function() {
  return this.response.hits.total;
 }
})
```

**Template**
Named functions can then be called by mustache, like:
```
<hr>{{meta.count_hits}} total hits<hr>
```

Functions called by mustache are executed before the actual render on the page, so no DOM manipulation can be done.   
The `before_render` and `after_render` lifecycle hooks will be called automatically. The former can be used for any pre-processing that might be required before rendering, and the latter should be used for anything that expects the HTML to be rendered.

#### Support for CSS

`<style>` tags can be embedded in the mustache template.

Another to load css files is to use a JS function (e.g. for FontAwesome):

**Javascript**

```sh
css: function() {  
      const css_list = ["https://use.fontawesome.com/releases/v5.6.3/css/all.css"];  
      for (let css_file of css_list) {
          const links = document.head.querySelectorAll("link");

          // Already been injected
          for(let l in links)
            if(links[l].href == css_file) return;
            const link = document.createElement('link');
            link.rel = "stylesheet";
            link.href = css_file;
            document.head.appendChild(link);
        } 
}
```

#### Query DSL

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

#### Debugging

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
### Advanced usage

The transform plugin makes use of a shadow DOM for the visualisation. This DOM is located below the div of which id is `output-vis`. 
Shadow DOM is a DOM feature that helps you build components. You can think of shadow DOM as a scoped subtree inside your element. See [here](https://polymer-library.polymer-project.org/2.0/docs/devguide/shadow-dom) for more details.
We then use [the shadowRoot command](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot) in order to access the shadow DOM and manipulate it.

This DOM will be used when you need to change the DOM from the javascript window which will be the case when using external librairies for visualisations (e.g. Google Chart): in that specific case, you should be using the `after_render` lifecycle hook.
When used in an OpenSearch Dashboard dashboard, we need to make sure we access the right shadow DOM in the case we have multiple transform visualisations. Make sure to always use unique IDs for HTML tag.

To do so, here are the javascript lines in charge of getting the right DOM. In this example, we need to find out where the `viz` ID is located in the shadow DOM in order to pass the location to the D3js function.
A dedicated function will be used to retrieve the shadow DOM information.

**Javascript**
```sh
({
after_render: function() {
    $.getScript("https://d3js.org/d3.v3.min.js")
        .done(function(script, textStatus) {
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
            
            // Get shadow DOM
            let ctxRadar = getShadowDomLocation("#viz").vizLocation[0];

            let sampleSVG = d3.select(ctxRadar)
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
         });
    }
}) 
```

Template:
```
<div id="viz"> </div>
```




## Samples

A new directory sample_vizs is now available with the following visualisations:

* sample_decisionTree.ndjson: Decision tree with D3js lib
* sample_googleChartGauge.ndjson: Gauge with Google Chart
* sample_googleChartScatterAndControlIframe.ndjson: Scatter chart with Goofle Chart byt using Iframe (might be reuqired in a few cases when there are JS librairies conflicts)
* sample_sankey.ndjson: Sankey with D3js lib
* sample_saveCSVToOpensearch.ndjson: Import CSV file into an OpenSearch index 

