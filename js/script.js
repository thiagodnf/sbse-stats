var url = "https://dl.dropbox.com/s/wntlmqmauuirrm3/references.bib?dl=1";
var spinner;
var maxResults = 30;
var rankingByCountries = [];
var rankingByAuthors = [];
var rankingByApplications = [];
var rankingByJournals = [];
var rankingByConferences = [];
var rankingByApplicationAndYear = [];

function sort(array){
	array.sort(function(a, b){
        var diff = parseInt(a.count) - parseInt(b.count);

        if(diff == 0){
            return 0;
        }else if(diff > 0){
            return -1;
        }else if(diff < 0){
            return 1;
        }
    });
}

function insertOrUpdate(array, label){
	var index = containts(array, label);

	if(index != -1){
		array[index].count++;
	}else{
		array.push({"label": label, "count": 1});
	}
}

function containts(array, label){
	for(var i=0;i<array.length;i++){
		if(array[i].label.trim() == label.trim()){
			return i;
		}
	}

	return -1;
}

function appendRow(tableId, columns){
	var row = "<tr>";

	$.each(columns, function(key, column){
		row += "<td>CONTENT</td>".replace("CONTENT", column);
	});

	row += "</tr>";

	$(tableId+" tr:last").after(row);
}

function showSpin(){
    var target = document.getElementById('charts');
    spinner = new Spinner().spin(target);
}

function hideSpin(){
    spinner.stop();
}

function showCredits(){
	$(".credits").removeClass("hide");
}

function viewDataAuthor(event){
	$('#modal-view-data-author').modal('show');
}

function viewDataApplication(){
	$('#modal-view-data-application').modal('show');
}

function viewDataJournal(){
	$('#modal-view-data-journals').modal('show');
}

function viewDataConference(){
	$('#modal-view-data-conferences').modal('show');
}

function loadBibtextFileFromUrl(){
    showSpin()

    $.ajax({
        url: url,
        dataType: "text",
        success: success,
        error: function( event, request, exception){
            //If exception null, then default to xhr.statusText
            var errorMessage = exception || event.statusText;

            $("#error").html(errorMessage);

            hideSpin();
        }
    });
}

function success(response){
    var entries = parse(response);

    var years = getYears(entries);

    var yearSeries = getYearSeries(entries, years);

    plotListOfPublications(yearSeries, years);

    plotNumberOfPublicationsByAuthor(entries);
    plotNumberOfPublicationsByApplication(entries);
	plotNumberOfPublicationsByJournal(entries, years);
	plotNumberOfPublicationsByConference(entries);
	plotNumberOfPublicationsByApplicationAndYear(entries);

    hideSpin();

	showCredits();
}

function getApplicationTypes(){
	return {
		"Coding Tools and Techniques": "1",
		"Design Tools and Techniques": "2",
		"Distributed Artificial Intelligence": "3",
		"Distribution and Maintenance": "4",
		"General Aspects and Survey": "5",
		"Management": "6",
		"Metrics": "7",
		"Network Protocols": "8",
		"Requirements/Specifications": "9",
		"Security and Protection": "10",
		"Software/Program Verification": "11",
		"Testing and Debugging": "12",
		"Testing and Debugging, General Aspects and Survey": "13",
	};
}

function getApplications(application){
	return getApplicationTypes()[application];
}

/** Convert the entry type to readable text */
function getEntryType(entryType){
     // types used for the different types of entries
     var types = {
         'article': 'Journal',
         'book': 'Book',
         'booklet': 'Booklet',
         'conference': 'Conference',
         'inbook': 'Book Chapter',
         'incollection': 'In Collection',
         'inproceedings': 'Conference',
         'manual': 'Manual',
         'mastersthesis': "Masters Thesis",
         'misc': 'Misc',
         'phdthesis': 'PhD Thesis',
         'proceedings': 'Conference Proceeding',
         'techreport': 'Technical Report',
         'unpublished': 'Unpublished'
     };

     return types[entryType];
}

function getYearSeries(entries, years){

    var stats = {};

    $.each(entries, function(key, entry) {
        if(!stats[entry.entryType]){
            stats[entry.entryType] = {};
        }

        if(!stats[entry.entryType][entry.year]){
            stats[entry.entryType][entry.year] = 1;
        }else{
            stats[entry.entryType][entry.year]++;
        }
    });

    var series = [];

    for (s in stats){

        var data = [];

        var toAppear = {};

        $.each(years, function(key, year){
            if(year.trim() == "To appear"){
                toAppear = stats[s][year] || 0;
            }else{
                data.push(stats[s][year] || 0);
            }
        });

        data.push(toAppear);

        // Add only the series that have at least a value
        var sum = data.reduce(function(a, b){return a+b;});

        if(sum > 0){
            series.push({name: getEntryType(s), data:data});
        }
    }

    return series;
}

/** Return only the years of the entries */
function getYears(entries){
    var years = [];

    $.each(entries, function(key, entry){
        if(years.indexOf(entry.year) == -1){
            // Do not add the 'To Appear' from chart
            if(entry.year && entry.year !== ""){
                years.push(entry.year);
            }
        }
    });

    // Sort the Array
    years.sort(function(a, b){
        if(a == "To appear"){
            a = 5000;
        }

        var diff = parseInt(a) - parseInt(b);

        if(diff == 0){
            return 0;
        }else if(diff > 0){
            return 1;
        }else if(diff < 0){
            return -1;
        }
    });

    return years;
};

function parse(content){
    console.log("Parsing...");

    // Creating the bibtex object for parse the bibtext file
    var bibtex = new BibTex();

    // Getting the div's content for parse it
    bibtex.content = content;

    // Parse the bibtext file
    bibtex.parse();

    console.log("Done");

     // Array with all entries
    var entries = [];

    // Save all converted entries
    for (var index = 0; index < bibtex.data.length; index++) {
        entries.push(bibtex.data[index]);
    }

    $.each(entries, function(key, entry){
        processEntry(entry);
    });

    return entries;
}

function processEntry(entry){
    // Call TRIM function in the all fields
    trimAllFields(entry);

    generateRankingByAuthors(entry);
    generateRankingByApplications(entry);
	generateRankingByJournals(entry);
	generateRankingByConferences(entry);
	generateRankingByApplicationAndYear(entry);
}

function trimAllFields(entry){
    for(c in entry){
        if( ! Array.isArray(entry[c])){
            entry[c] = entry[c].trim();
        }
    }
}

function generateRankingByAuthors(entry){
    $.each(entry.author, function (index, value) {
		insertOrUpdate(rankingByAuthors, value.last.trim());
	});
}

function generateRankingByConferences(entry){
	// Only conferences entry type is considered in this ranking
	if(entry.entryType != "inproceedings"){
		return;
	}

	if(entry.booktitle == undefined || entry.booktitle == ""){
		//console.log("Problem in "+entry.cite);
		return;
	}

	var index = entry.booktitle.indexOf("(");

	var txt = entry.booktitle.substring(index, entry.booktitle.length);

	txt = txt.replace("(", "").replace(")", "");

	var conf = txt.split('\'');

	if(conf.length != 1){
		insertOrUpdate(rankingByConferences, conf[0].trim());
	}else{
		conf = txt.split('’');
		if(conf.length != 1){
			insertOrUpdate(rankingByConferences, conf[0].trim());
		}else{
			//console.log("Problem in "+entry.booktitle);
		}
	}
}

function generateRankingByJournals(entry){
	// Only journals entry type is considered in this ranking
	if(entry.entryType != "article"){
		return;
	}

	insertOrUpdate(rankingByJournals, entry.journal.trim());
}

function generateRankingByApplications(entry){
    insertOrUpdate(rankingByApplications, entry.application)
}

function generateRankingByApplicationAndYear(entry){
	if(entry.application == undefined || entry.application == ""){
		return;
	}

	var index = getApplications(entry.application);

	insertOrUpdate(rankingByApplicationAndYear, entry.year + "_" + index);
}

function plotListOfPublications(series, years){
    $("#chart-publication").highcharts({
         chart: {
             type: 'column',
             marginTop: 100,
             height: 600
         },
         title: {
             text: "List of Publications"
         },
         xAxis: {
             categories: years
         },
         yAxis: {
             min: 0,
             title: {
                 text: "Number of Papers"
             },
             stackLabels: {
                 enabled: true,
                 style: {
                     fontWeight: 'bold',
                     color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                 }
             }
         },
         legend: {
             enabled: true,
             align: 'right',
             x: -30,
             verticalAlign: 'top',
             y: 30,
             floating: true,
             backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
             borderColor: '#CCC',
             borderWidth: 1,
             shadow: false
         },
         tooltip: {
             headerFormat: '<b>{point.x}</b><br/>',
             pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
         },
         plotOptions: {
             column: {
                 stacking: 'normal',
                 dataLabels: {
                     enabled: true,
                     color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                     style: {
                         textShadow: '0 0 3px black'
                     },
                     formatter: function() {
                         if (this.y !== 0) {
                             return this.y;
                         } else {
                             return null;
                         }
                    }
                 }
             }
         },
         credits: {
             enabled: false
         },
         series: series
     });
}

function plotNumberOfPublicationsByAuthor(entries){

	sort(rankingByAuthors);

    var categories = [];

    var series = [];

    var data = [];

	$.each(rankingByAuthors, function(key, entry){

	    if(data.length != maxResults){
	        categories.push(entry.label);
	        data.push(entry.count);
		}

		appendRow("#table-view-data-author", [(key+1), entry.label, entry.count]);
	});

    series.push({name: "Number of Papers", data: data});

	var options = {
		elementId: "#chart-author",
		categories: categories,
		series: series,
		title: "Number of Publications by Author",
		viewData: viewDataAuthor
	};

	plotBasicBarChart(options);
}

function plotNumberOfPublicationsByJournal(entries){

	sort(rankingByJournals);

    var categories = [];

    var series = [];

    var data = [];

	$.each(rankingByJournals, function(key, entry){

	    if(data.length != maxResults){
	        categories.push(entry.label);
	        data.push(entry.count);
		}

		appendRow("#table-view-data-journals", [(key+1), entry.label, entry.count]);
	});

    series.push({name: "Number of Papers", data: data, color: "#90ed7d"});

	var options = {
		elementId: "#chart-journals",
		categories: categories,
		series: series,
		title: "Number of Publications by Journal",
		viewData: viewDataJournal
	};

	plotBasicBarChart(options);
}

function plotNumberOfPublicationsByConference(entries){

    sort(rankingByConferences);

    var categories = [];

    var series = [];

    var data = [];

	$.each(rankingByConferences, function(key, entry){

	    if(data.length != maxResults){
	        categories.push(entry.label);
	        data.push(entry.count);
		}

		appendRow("#table-view-data-conferences", [(key+1), entry.label, entry.count]);
	});

    series.push({name: "Number of Papers", data: data, color: "#f7a35c"});

	var options = {
		elementId: "#chart-conferences",
		categories: categories,
		series: series,
		title: "Number of Publications by Conference",
		viewData: viewDataConference
	};

	plotBasicBarChart(options);
}

function plotNumberOfPublicationsByApplication(entries){
    var data = [];

    var sumOthers = 0;

	// Sort the Array
    sort(rankingByApplications);

    $.each(rankingByApplications, function(key, entry){
        if(entry.count / entries.length< 0.02){
            sumOthers += entry.count;
        }else if(entry.label == ""){
            // data.push({name: "No Informed", y: entry.count});
        }else{
            data.push({name: entry.label.replace(" and "," and <br>"), y: entry.count});
        }

		var label = (entry.label === "")?"No Informed": entry.label;

		$('#table-view-data-application tr:last').after('<tr><td>'+(key+1)+'</td><td>'+label+'</td><td>'+entry.count+'</td></tr>');
    });

    data.push({name: "Others", y: sumOthers});

    $('#chart-application').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: 500
        },
        title: {
            text: "Number of Publications by Application"
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        credits: {
            enabled: false
        },
		exporting: {
            buttons: {
                customButton: {
                    x: -40,
                    onclick: viewDataApplication,
                    text: "View data"
                }
            }
        },
        series: [{
            name: 'Number of Papers',
            colorByPoint: true,
            data: data
        }]
    });
}

function plotNumberOfPublicationsByApplicationAndYear(entries){

	var data = [];

	var applicationTypes = getApplicationTypes();

	var types = {};

	$.each(applicationTypes , function(key, entry){
		types[entry] = key;
	});

	$.each(rankingByApplicationAndYear, function(key, entry){
		var split = entry.label.split("_");
		data.push({x: parseInt(split[0]), y: parseInt(split[1]), z: entry.count, name: 'BE', country: 'Belgium'});
	});

	$('#chart-publication-application').highcharts({
        chart: {
            type: 'bubble',
            plotBorderWidth: 1,
            zoomType: 'xy',
			height: 500
        },
        legend: {
            enabled: false
        },
        title: {
            text: 'Number of Publications by Year and Application'
        },
        xAxis: {
            gridLineWidth: 1,
			min: 1974,
            tickInterval: 1,
			labels: {
                rotation: -45,
            }
        },
		yAxis: {
			min: 0,
            max: 14,
            tickInterval: 1,
			title: {
				text: ""
			},
			labels: {
                formatter: function() {
					if(this.value <=0 || this.value >=types.length){
						return "";
					}
					return types[this.value];
				}
            },

        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.z}'
                }
            }
        },
		credits: {
            enabled: false
        },
        series: [{
            data: data
        }]
    });
}

function plotBasicBarChart(options){

	$(options.elementId).highcharts({
        chart: {
            type: 'bar',
            height: options.height || 700
        },
        title: {
            text: options.title
        },
		subtitle: {
			text: options.subtitle || 'An Estimate'
		},
        xAxis: {
            categories: options.categories,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: options.yAxisTitle || 'Number of Papers',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        legend: {
            enabled: options.enabledLegend || false,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
		exporting: {
            buttons: {
                customButton: {
                    x: -40,
                    onclick: options.viewData,
                    text: "View data"
                }
            }
        },
        credits: {
            enabled: false
        },
        series: options.series
    });
}

$(function(){
    loadBibtextFileFromUrl();
});
