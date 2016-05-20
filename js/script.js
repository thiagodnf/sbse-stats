var url = "https://dl.dropbox.com/s/wntlmqmauuirrm3/references.bib?dl=1";
var spinner;
var rankingByCountries = [];
var rankingByAuthors = [];
var rankingByApplications = [];

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

function showSpin(){
    var target = document.getElementById('spin');
    spinner = new Spinner().spin(target);
}

function hideSpin(){
    spinner.stop();
}

function viewDataAuthor(){
	$('#modal-view-data-author').modal('show');
}

function viewDataApplication(){
	$('#modal-view-data-application').modal('show');
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

    plotPlubicationsNumberByAuthors(entries);

    plotPlubicationsNumberByApplications(entries);
    //plotPublicationsNumberInTheWorldCountries();
    //console.log(rankingByAuthors);

    //console.log(rankingByApplications)
    hideSpin();
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

    //generateRankingByCountries(entry);
    generateRankingByAuthors(entry);
    generateRankingByApplications(entry);
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
		insertOrUpdate(rankingByAuthors, value.last);
	});
}

function generateRankingByCountries(entry){
    if(entry.entryType != "article" && entry.entryType != "inproceedings"){
        return;
    }

    if(entry.address == undefined){
		console.log("The address entry is required: " + entry.cite);
	}else{
		var addresses = entry.address.split(",");

		if(addresses.length <= 1 || addresses.length >= 4){
			console.log("The entry is wrong: " + entry.cite);
		}else{
			insertOrUpdate(rankingByCountries, addresses[addresses.length-1].trim());
		}
	}
}

function generateRankingByApplications(entry){
    insertOrUpdate(rankingByApplications, entry.application)
}

function plotListOfPublications(series, years){
    $("#chart-publications").highcharts({
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

function plotPublicationsNumberInTheWorldCountries(){

    var data = [];

    $.each(rankingByCountries, function(key, entry){
        data.push({name: entry.label, y: entry.count});
    });

    $('#chart-2').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: "Publications Number In The World Countries"
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: data
        }]
    });
}

function plotPlubicationsNumberByAuthors(entries){
    // Sort the Array
    rankingByAuthors.sort(function(a, b){
        var diff = parseInt(a.count) - parseInt(b.count);

        if(diff == 0){
            return 0;
        }else if(diff > 0){
            return -1;
        }else if(diff < 0){
            return 1;
        }
    });

    var categories = [];

    var series = [];

    var max = 30;

    var data = [];

	$.each(rankingByAuthors, function(key, entry){

	    if(data.length != 30){
	        categories.push(entry.label);
	        data.push(entry.count);
		}

		$('#table-view-data-author tr:last').after('<tr><td>'+(key+1)+'</td><td>'+entry.label+'</td><td>'+entry.count+'</td></tr>');
    });

    series.push({name: "Authors", data: data});

    var chart = $('#chart-author').highcharts({
        chart: {
            type: 'bar',
            height: 700
        },
        title: {
            text: "Number Of Publications by Author"
        },
        xAxis: {
            categories: categories,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Number of Papers',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        legend: {
            enabled: false,
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
        tooltip: {
            valueSuffix: ' papers'
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
                    onclick: viewDataAuthor,
                    text: "View data"
                }
            }
        },
        credits: {
            enabled: false
        },
        series: series
    });

	//chart.renderer.button('Click me', 150, 25, function(){alert("oi")})
}

function plotPlubicationsNumberByApplications(entries){
    var data = [];

    var sumOthers = 0;

	// Sort the Array
    rankingByApplications.sort(function(a, b){
        var diff = parseInt(a.count) - parseInt(b.count);

        if(diff == 0){
            return 0;
        }else if(diff > 0){
            return -1;
        }else if(diff < 0){
            return 1;
        }
    });

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
            text: "Number Of Publications by Application"
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

$(function(){
    loadBibtextFileFromUrl();
});
