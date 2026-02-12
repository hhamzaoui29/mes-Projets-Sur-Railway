

const heures = document.querySelector('.heures');
const date   = document.querySelector('.date');


let horloge = function() {
                              let  year, month, monthsList, daysList, dayNumber, dayName, today, hours, minutes, secondes, showHour;

                                //je récupere la date:
                                today = new Date();
                                console.log(" today == ", today);

                                // je récupere l'année
                                year = today.getFullYear();
                                console.log(" year == ", year);

                                //je récupere les mois
                                monthsList = [
                                                "Janvier","Fèvrier","Mars","Avril","Mai","Juin",
                                                "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
                                              ];
                                month = monthsList[today.getMonth()];
                                console.log("month ==", month);

                                //Je récupere le N° du jours dans le mois
                                dayNumber = today.getDate();
                                console.log("dayNumber ==", dayNumber);

                                //Je récupere les jours
                                daysList = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
                                dayName = daysList[today.getDay()];
                                console.log("dayName == ", dayName);

                                // J'affiche les heurs, les minutes et les secondes
                                showHour = function(element){
                                                                if(element < 10 ){
                                                                                    return element = "0" + element;
                                                                                 } else {
                                                                                            return element
                                                                                        }
                                                             }
                                console.log ("showHour == ", showHour);

                                // Je récupere l'heure:
                                hours  = showHour(today.getHours());
                                console.log ("hours = ", hours);

                                 // Je récupere l'heure:
                                 minutes  = showHour(today.getMinutes());
                                 console.log ("minutes = ", minutes);

                                  // Je récupere l'heure:
                                secondes  = showHour(today.getSeconds());
                                console.log ("secondes = ", secondes);

                                //J'affiche dans mes divs
                                date.textContent =  dayName  + " " + dayNumber + " " + month + " " + year;
                                heures.textContent = "Il est : " + hours + ":" + minutes ; 

                                // Lancement de la fonction d'affichage
                                setTimeout( horloge, 1000);
                         
                         }

// lancement de la fonction
 horloge ();