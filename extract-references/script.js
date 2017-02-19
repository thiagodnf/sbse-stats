var terms = [
	{search:"Matheus Paixao", term: "Matheus Henrique Esteves Paixão"},
	{search:"Thiago Nepomuceno", term: "Thiago Gomes Nepomuceno da Silva"},
	{search:"Fabrício G. Freitas", term: "Fabrício Gomes de Freitas"},
	{search:"Chris Simons", term: "Christopher L. Simons"},
	{search:"and and Xin Yao", term: "and Xin Yao"},
	{search:"William Langdon", term: "William B. Langdon"},
	{search:"Jerffeson Souza", term: "Jerffeson Teixeira de Souza"},
	{search:"Thiago Gomes Nepomuceno Da Silva", term: "Thiago Gomes Nepomuceno da Silva"},
	{search:"Marcio de Oliveira Barros", term: "Márcio de Oliveira Barros"},
	{search:"Flavia Barros", term: "Flavia de A. Barros"},
	{search:"Aurora Pozo", term: "Aurora Trinidad Ramirez Pozo"},
	{search:"Thiago Ferreira", term: "Thiago do Nascimento Ferreira"},
	{search:"Marcia Brasil", term: "Márcia Maria Albuquerque Brasil"},
	{search:"Roberto E. Lopez-Herrejon", term: "Roberto Erick Lopez-Herrejon"},
	{search:"Günther Ruhe", term: "Guenther Ruhe"},
	{search:"Lionel Briand", term: "Lionel C.Briand"},
	{search:"Lionel C.Briand", term: "Lionel C. Briand"},
	{search:"Taghi Khoshgoftaar", term: "Taghi M. Khoshgoftaar"},
	{search:"Yi (Cathy) Liu", term: "Yi Liu"},
	{search:"Robert M. Hierons", term: "Robert Mark Hierons"},
	{search:"Massililiano Di Penta", term: "Massimiliano Di Penta"},
	{search:"Giulio Antoniol", term: "Giuliano Antoniol"},
	{search:"Jiří Kubalík", term: "Jiri Kubalik"},
	{search:"Jiří Kubalik", term: "Jiri Kubalik"},
	{search:"Jose Ribeiro", term: "José Carlos Bregieiro Ribeiro"},
	{search:"Tanja E.J. Vos", term: "Tanja E. J. Vos"},
	{search:"J. Swan", term: "Jerry Swan"},
	{search:"Betty H.C. Cheng", term: "Betty H. C. Cheng"},
	//
	{search:"Soft Computing - A Fusion of Foundations, Methodologies and Applications", term: "Soft Computing"},
	{search:"Information and Software Technology Special Issue on Software Engineering using Metaheuristic Innovative Algorithms", term: "Information and Software Technology"},
	{search:"IEEE Transactions On Software Engineering", term: "IEEE Transactions on Software Engineering"},
	{search:"Journal of Systems and Software (Special Issue: Selected papers from the 2008 IEEE Conference on Software Engineering Education and Training (CSEET '08))", term: "Journal of Systems and Software"},
	{search:"The Journal of Systems and Software", term: "Journal of Systems and Software"},
	{search:"Journal of Software Testing, Verification and Reliability", term: "Software Testing, Verification and Reliability"},
	{search:"Journal of Empirical Software Engineering", term: "Empirical Software Engineering"},
	{search:"ACM Transactions on Software Engineering and Methodology (TOSEM)", term: "ACM Transactions on Software Engineering and Methodology"},
	{search:"Software -- Practice and Experience", term: "Software: Practice and Experience"},
	{search:"IEEE Transactions On Reliability", term: "IEEE Transactions on Reliability"},
	{search:"Expert Systems with Applications: An International Journal", term: "Expert Systems with Applications"},
	{search:"International Journal of Software Engineering & Applications", term: "Journal of Software Engineering and Applications"},
	{search:"International Journal of Software Engineering and Knowledge Engineering (IJSEKE)", term: "International Journal of Software Engineering and Knowledge Engineering"},
	{search:"Journal of Software Maintenance: Research and Practice", term: "Journal of Software Maintenance and Evolution: Research and Practice"},
	{search:"	Journal of Software Maintenance and Evolution: Research and Practice (Special Issue Search Based Software Engineering)", term: "Journal of Software Maintenance and Evolution: Research and Practice"},
	{search:"ACM Computing Surveys (CSUR)", term: "ACM Computing Surveys"},
	{search:"International Journal of Information Technology & Decision Making", term: "Journal of Information Technology & Decision Making"},
	//{search:"", term: ""},
];

var fs = require('fs');

/*String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};*/

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function removeFile(file){
	fs.exists(file, function(exists) {
		if(exists) {
			//Show in green
			console.log('File exists. Deleting now ...');
			fs.unlink(file);
		} else {
			//Show in red
			console.log('File not found, so not deleting.');
		}
	});
}

function writeFile(file, content){
	fs.writeFile(file, content, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	}); 
}

fs.readFile('input.bib', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}

	var content = data;

	for(var i = 0; i < terms.length; i++){
		content = content.replaceAll(terms[i].search, terms[i].term);
	}

	writeFile("references.bib", content);
});
