/***
**  This code is a MVC pattern implemantation for make a calendar wich easly modifycable.
***/

var names_days = {'Sunday': 'Domingo', 'Monday': 'Lunes', 'Tuesday': 'Martes', 'Wednesday': 'Miercoles', 'Thrusday': 'Jueves', 'Friday': 'Viernes', 'Saturday': 'Sabado' };

var names_months = {'January': 'Enero' , 'February': 'Febrero', 'March': 'Marzo', 'April': 'Abril', 'May': 'Mayo', 'June': 'Junio', 'July': 'Julio', 'August': 'Agosto', 'September': 'Septiembre', 'October': 'Octubre', 'November': 'Noviembre', 'December': 'Diciembre' };

/***
**  Translation class for calendar internationalization
***/

class Translate {

  constructor(dictionary){
		self.dictionary = (dictionary != null) ? dictionary : {};
    self.lang = navigator.language.split("-")[0];
  }

  t(key){
    if (self.lang == 'es' && Object.keys(self.dictionary).length != 0 ){
      return self.dictionary[key];
    }else if(Object.keys(self.dictionary) == 0){
      return key;
		}else{
			return key;
    }
  }
}

/***
**   Model class where is behaivor describe to manage holidays data
***/

class Calendar {
  
  constructor(today= new Date(), urlApi='http://nolaborables.com.ar/api/v2/feriados'){
    self.today = today;
    self.urlApi = urlApi;
    self.selectDate = today;
    self.holidaysData = [];
    self._prevYear = -1;
    self.namesDays = new Array("Sunday", "Monday", "Thuesday","Wednesday", "Thrusday","Friday","Saturday");
    self.namesMonths = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
    this.getHolidays();
  }

  get holidaysData(){
    return self.holidaysData;
  }

  getQuantityDays(){
		return new Date(self.selectDate.getFullYear(), self.selectDate.getMonth()+1,0).getDate();
	}

  // override method by use anything url api
  getHolidays(){
    if (self._prevYear != self.selectDate.getFullYear()){
      let promise = new Promise( function (resolve,reject){
				let xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						self.holidaysData = JSON.parse(xhttp.responseText);
            self.calendar.holidaysMonth().forEach( function (holiday){ document.getElementById(holiday.dia).classList.add('holiday') } );
            resolve(self.holidaysData);
					}else{
            reject("Error");
          }
				};
				let url = self.urlApi + `/${self.selectDate.getFullYear()}`;
				xhttp.open("GET", url , true);
				xhttp.send();
      });
      promise.then(function success(result){return result}, function reject(error){ console.log(error)} );
    }
    self.holidaysData;
  }

  prevMonth(){
		self.selectDate.setMonth(self.today.getMonth() - 1);
    this.getHolidays();
  }

  nextMonth(){
		self.selectDate.setMonth(self.today.getMonth() + 1);
    this.getHolidays();
  }

  holidaysMonth(){
		return self.holidaysData.filter( function (elem){ return elem.mes == self.selectDate.getMonth()+1} );
  }

  selectDay(number){
		self.selectDate.setDate(number);
	}

  get currentDate(){
    return self.selectDate;
  }

  getMonthName(){
    return self.namesMonths[self.selectDate.getMonth()];
  }
}

/***
**  Behavior about view class
***/

class CalendarView {

  constructor(template,dictionary){
    self.calendar = new Calendar();
    self.translate = new Translate(dictionary);
    self.template = template;
		let css = template.content.querySelector("#calendar_link");
		if (document.querySelector('head').querySelector("#calendar_link") == undefined) {
		  document.querySelector('head').append(css);
	  }
    self.calendar_view = self.template.content.getElementById("calendar").cloneNode(true);
    self.days_view = self.calendar_view.querySelector("#days");
    self.day_view = self.days_view.children[0].children[1].cloneNode(true);
    self.days_view.children[0].children[1].remove(true);
    document.getElementById("wrapper").innerHTML = "";
  }
 
  get calendar(){
    return self.calendar;
  }

  fill_holidays(){
    let elem, calendar_view, days_view, current_day; 
    calendar_view = this.cloneTemplate();
		let spans = calendar_view.querySelectorAll("span");
    [].forEach.call(spans, function (d){ d.textContent = self.translate.t(d.textContent)});
		days_view = calendar_view.querySelector("#days");
    current_day = new Date(self.calendar.currentDate.getFullYear() , self.calendar.currentDate.getMonth() , 1 ).getDay();
    for(let d=0; d < current_day; d++){
       let day = day_view.cloneNode(true);
       day.innerHTML = "_";
			 days_view.children[d % 7].append(day);
    }
    calendar_view.querySelector("#year").innerHTML = self.translate.t(self.calendar.getMonthName()) + " " + self.calendar.currentDate.getFullYear();
		for (var i=1; i <= self.calendar.getQuantityDays(); i++){
       let day = day_view.cloneNode(true);
       day.setAttribute("id",i);
       day.innerHTML = i;
			 days_view.children[current_day % 7].append(day);
			 current_day++;
		}

    let days = calendar_view.querySelectorAll(".day");
    [].forEach.call(days,function (o){ o.onclick = function (o){
        if (o.target.textContent != '_'){
					[].forEach.call(days, function (e){ 
						e.classList.remove("selected")
					});

					o.target.classList.add("selected");
					self.calendar.selectDay(parseInt(o.target.textContent));
        }else{
          alert("Not valid date");
        }
      }
    });
		calendar_view.getElementById(`${self.calendar.currentDate.getDate()}`).classList.add("selected");
    var wrap = document.getElementById("wrapper");
    wrap.innerHTML = "";
    wrap.append(calendar_view);
    self.calendar.holidaysMonth().forEach( function (holiday){ document.getElementById(holiday.dia).classList.add('holiday') } );
  }

  cloneTemplate(){
    let view = this;
		let calendar_view = self.template.content.cloneNode(true);
    let prev = calendar_view.querySelector("#prev");
    let next = calendar_view.querySelector("#next");
    calendar_view.querySelector(".day").remove(true);
    document.getElementById("wrapper").innerHTML = ""
    prev.onclick = function(){ 
      view.calendar.prevMonth();
      view.fill_holidays();
	    document.querySelector("#calendar").classList.add("zoom-background");
    };

    next.onclick = function(){ 
      view.calendar.nextMonth();
      view.fill_holidays(); 
	    document.querySelector("#calendar").classList.add("zoom-background");
    };
    return calendar_view;
  }
}
