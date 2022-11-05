jQuery.sap.declare("com.cementos.pacasmayo.cpgestionstock.util.Formatter");
jQuery.sap.require("sap.ui.core.format.DateFormat");

com.cementos.pacasmayo.cpgestionstock.util.Formatter = {
    
	statusText :  function (value) {
		var bundle = this.getModel("i18n").getResourceBundle();
		return bundle.getText("StatusText" + value, "?");
	},
	
	statusState :  function (value) {
		var map = sap.ui.demo.myFiori.util.Formatter._statusStateMap;
		return (value && map[value]) ? map[value] : "None";
	},
	getfecha : function(fecha){
       	if(fecha != "" && fecha != null){
	       	var valueDate = fecha;
		    var d = new Date(valueDate);
			d.setDate(d.getDate() + 1);
			d = d.toLocaleDateString();
			var parts = d.split('/');
			if(parts[0] < 10) parts[0] = '0' + parts[0];
			if(parts[1] < 10) parts[1] = '0' + parts[1];
			return parts[0] + '.' + parts[1] + '.' + parts[2];
       	}
       	else{
       		return "";
       	}
	},
	quantity :  function (value) {
		try {
			return (value) ? parseFloat(value).toFixed(0) : value;
		} catch (err) {
			return "";
		}
	},
	
	time : function (value)
	{
			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({  
			     source:{pattern:"KKmmss"},  
			     pattern: "KK:mm:ss"}  
			);  
			    value = oDateFormat.parse(value);  
				return oDateFormat.format(new Date(value)); 
	},
	date_time: function(value){
		if(value !== "" && value !== null){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy hh:mm:ss a"});	
			return oDateFormat.format(value);
		}
       	else{
       		return "";
       	}
	},
	date_formatter: function(fecha){
		if(fecha != "" && fecha != null){
	       	var valueDate = fecha;
		    var d = new Date(valueDate);
			d = d.toLocaleDateString();
			var parts = d.split('/');
			if(parts[0] < 10) parts[0] = '0' + parts[0];
			if(parts[1] < 10) parts[1] = '0' + parts[1];
			return parts[0] + '.' + parts[1] + '.' + parts[2];
       	}
       	else{
       		return "";
       	}
	},
	date_var_formatter: function(fecha, formatter){
		if(fecha !== "" && fecha !== null && fecha !== undefined){
			if(!formatter) formatter = "dd.MM.yyyy";
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: formatter});	
			return oDateFormat.format(fecha);
		}
       	else{
       		return "";
       	}	
	},
	dates : function (value) {
		if (value =="00000000"){
		 return ;
		} else{
			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({  
			     source:{pattern:"MM-dd-yyyy"},  
			     pattern: "dd-MM-yyyy"}  
			);  		
	        value = oDateFormat.parse(value);  
			return oDateFormat.format(new Date(value)); 		
		}
	},
	only_date: function(value){
		if(value !== "" && value !== null){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd.MM.yyyy"});	
			return oDateFormat.format(value);
		}
       	else{
       		return "";
       	}
	},
	only_time:  function(value){
		if(value !== "" && value !== null){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "hh:mm:ss a"});	
			return oDateFormat.format(value);
		}
       	else{
       		return "";
       	}
	},
	//Función para quitar los 0
	integer: function(num){
		try {
			return (num) ? parseInt(num) : num;
		} catch (err) {
			return "Not-A-Number";
		}
	},
	borrar0izalfanumerico: function(valor){
		if(valor != null && valor != undefined && valor != ""){
			var val = valor;
			for (var i = 0; i < valor.length; i++) {
				if(val.substr(0, 1) == 0){
					val=val.substr(1, val.length-1);
				}
			}
			return val;
		}else{
			return valor;
		}
	},
	getSexo: function(value){
		if(value == "M"){
			return "Masculino";
		}else if(value == "F"){
			return "Femenino";
		}else{
			return;
		}
	},	getIdioma: function(value){
		if(value == "01"){
			return "Español";
		}else if(value == "02"){
			return "Ingles";
		}else{
			return;
		}
	},
	redondearDec: function(value, dec){
		if(value != undefined && value != null && value != '' && dec != undefined && dec != null && dec != ''){
			var ceros = '1';
			for (var i = 0; i < dec; i++) {
				ceros += '0';
			}
			return Math.round(value*parseInt(ceros))/parseInt(ceros);
		}else{
			return 0.000
		}
	},
	monto: function(value){
		if(value != null && value != undefined){
			return parseFloat(value).toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");	
		}else{
			return "";
		}
   	},
   	meses: function(){
		var mes = [{"mes": "01", "mes_desc": "ENERO"}, {"mes": "02", "mes_desc": "FEBRERO"}, {"mes": "03", "mes_desc": "MARZO"}, {"mes": "04", "mes_desc": "ABRIL"}, {"mes": "05", "mes_desc": "MAYO"}, {"mes": "06", "mes_desc": "JUNIO"}, {"mes": "07", "mes_desc": "JULIO"}, {"mes": "08", "mes_desc": "AGOSTO"}, {"mes": "09", "mes_desc": "SETIEMBRE"}, {"mes": "10", "mes_desc": "OCTUBRE"}, {"mes": "11", "mes_desc": "NOVIEMBRE"}, {"mes": "12", "mes_desc": "DICIEMBRE"}];

		return mes;
	},
	anioIA: function(anio){
		var fechaA = new Date(),
			anioA = fechaA.getFullYear(),
			anioArray = [],
			diferencia = new Array(parseInt(anioA) - parseInt(anio));


		anioArray.push({"anio": anio, "anio_desc": anio});

		$.each(diferencia, function(k, v){
			anio = parseInt(anio + 1);
			anioArray.push({"anio": anio.toString(), "anio_desc": anio.toString()});
		});

		return anioArray;
	}
};