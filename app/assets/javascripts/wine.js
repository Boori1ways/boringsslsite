jQuery( document ).ready(function() {

	var gbr = FUSION.get.browser();
	if(gbr.browser && gbr.browser == "IE")
	{
		document.body.style.setProperty("font-family", "'Trebuchet MS', Helvetica, sans-serif", "important");
	}

//https://www.datatables.net/extensions/rowreorder/examples/initialisation/responsive.html
//https://datatables.net/examples/basic_init/dom.html
	var wine_col_defs = [{ "targets": [ 0 ], "searchable": false, "orderable": false }];
	$('#wine_results_table').DataTable({
		"dom": '<"top"fli>rt<"bottom"p><"clear">',
		order: [[ 1, "asc" ]],
		columnDefs: wine_col_defs,
		rowReorder: {
            selector: 'td:nth-child(5)'
        },
        responsive: true
	});

});


function clearForm()
{

	/*FUSION.get.node("varietal").value = "";
	FUSION.get.node("country").value = "";
	FUSION.get.node("region").value = "";
	FUSION.get.node("size").value = "";*/
	$('.selectpicker').selectpicker('val', '');
	FUSION.get.node("score_low").value = "";
	FUSION.get.node("score_high").value = "";
	FUSION.get.node("price_low").value = "";
	FUSION.get.node("price_high").value = "";
	FUSION.get.node("vintage_low").value = "";
	FUSION.get.node("vintage_high").value = "";
	var tbl = $('#wine_results_table').DataTable();
	tbl.clear().draw();
}


function runParamSearch()
{
	try {

		$("#loading_spinner").toggleClass('showhidespinner');

		var vrtl = FUSION.get.node("varietal").value;
		var ctry = FUSION.get.node("country").value;
		var regn = FUSION.get.node("region").value;
		var size = FUSION.get.node("size").value;
		var scrL = FUSION.get.node("score_low").value;
		var scrH = FUSION.get.node("score_high").value;
		var prcL = FUSION.get.node("price_low").value;
		var prcH = FUSION.get.node("price_high").value;
		var vntL = FUSION.get.node("vintage_low").value;
		var vntH = FUSION.get.node("vintage_high").value;

		var score_str = "";
		scrL = FUSION.lib.isBlank(scrL) ? "*" : scrL;
		scrH = FUSION.lib.isBlank(scrH) ? "*" : scrH;
		if(scrL == scrH && scrL == "*") {
			score_str = "";
		}
		else {
			score_str = scrL + "-" + scrH;
		}

		var price_str = "";
		if(!FUSION.lib.isBlank(prcL)) {
			prcL = parseInt(prcL) * 100;
		}
		if(!FUSION.lib.isBlank(prcH)) {
			prcH = parseInt(prcH) * 100;
		}
		prcL = FUSION.lib.isBlank(prcL) ? "*" : prcL;
		prcH = FUSION.lib.isBlank(prcH) ? "*" : prcH;
		if(prcL == prcH && prcL == "*") {
			price_str = "";
		}
		else {
			price_str = prcL + "-" + prcH;
		}

		var vntge_str = "";
		vntL = FUSION.lib.isBlank(vntL) ? "*" : vntL;
		vntH = FUSION.lib.isBlank(vntH) ? "*" : vntH;
		if(vntL == vntH && vntL == "*") {
			vntge_str = "";
		}
		else {
			vntge_str = vntL + "-" + vntH;
		}

		var tbl = $('#wine_results_table').DataTable();
		tbl.clear().draw();

		var info = {
			"type": "POST",
			"path": "/pages/1/searchWines",
			"data": {
				"varietal":		(vrtl == "All" || vrtl == "all") ? "" : vrtl.toLowerCase(),
				"country":		(ctry == "All" || ctry == "all") ? "" : ctry.toLowerCase(),
				"region":		(regn == "All" || regn == "all") ? "" : regn.toLowerCase(),
				"size":			(size == "All" || size == "all") ? "" : size,
				"scores":		score_str,
				"price_range":	price_str,
				"vintage":		vntge_str
			},
			"func": runSearchResponse
		};
		FUSION.lib.ajaxCall(info);
	}
	catch(err) {
		$("#loading_spinner").toggleClass('showhidespinner');
		FUSION.error.logError(err);
	}
}


function runSearchResponse(h)
{
	try {
		var hash = h || {};
		var nums = parseInt(hash['number_of_results']);
		var site = "http://www.benchmarkwine.com";

		if(nums > 0)
		{
			var tbl = $('#wine_results_table').DataTable();
			var wines = hash['wine_results'];
			var wine = {};
			var revs = {};
			var revarr = [];
			var revstr = "";
			var img = "";
			var avlstr = "";
			for(var i = 0; i < wines.length; i++)
			{
				wine = wines[i];
				if(FUSION.get.objSize(wine['reviews']) > 0)
				{
					revarr = [];
					revs = wine['reviews'];
					for(var rev in revs) {
						revarr.push("<span class='score_label'>" + rev.toString() + "</span><span class='score'>" + revs[rev] + "</span>");
					}
					revstr = revarr.join("<br>");
				}

				img = wine['thumb'].match(/^\/(assets)/) ? site + wine['thumb'] : wine['thumb'];

				avlstr = wine['in_stock'] + " In-Stock";
				if(FUSION.lib.isBlank(wine['in_stock'])) {
					avlstr = wine['available'];
				}
				var rowNode = tbl.row.add( [
					"<img class='wine_image' src='" + img + "' />",
					"<a href='http://www.benchmarkwine.com" + wine['link'] + "' target='_blank'>" + wine['name'] + "</a>",
					wine['details']['region'] + "<br>" + wine['details']['varietal'] + "<br>" + wine['details']['size'] + "<br>" + wine['details']['vintage'],
					revstr,
					wine['price'],
					avlstr
				] ).draw( false ).node();
				$( rowNode ).find('td').eq(0).addClass('img_td_class');
				$( rowNode ).find('td').eq(3).addClass('score_td_class');
				$( rowNode ).find('td').eq(4).addClass('price_td_class');
				$( rowNode ).find('td').eq(5).addClass('avail_td_class');
			}
		}

// 		FUSION.get.node("fLabel").textContent = (nums > 1) ? "Filter " + nums + " Results:" : "Filter Results:";
	}
	catch(err) {
		FUSION.error.logError(err);
	}
	$("#loading_spinner").toggleClass('showhidespinner');
}
