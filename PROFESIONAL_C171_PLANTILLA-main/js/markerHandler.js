var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function() {

    if (tableNumber === null) {
      this.askTableNumber();
    }

    var dishes = await this.getDishes();

    this.el.addEventListener("markerFound", () => {
      if(tableNumber!==null){
      var markerId = this.el.id;
      this.handleMarkerFound(dishes, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askTableNumber: function() {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    
    swal({
        icon: iconUrl,
        title:"ola",
        content:{element:"input",attributes:{placeholder:"cual es su numero de mesa",type:"number",min:1}},
        closeOnClickOutside:false
      }),then(inputValue=>{
        tableNumber=inputValue
      })
    
  },

  handleMarkerFound: function(dishes, markerId) {
    // Obtener el día
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    
    // De domingo a sábado: 0 - 6
    var days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
    ];

    var dish = dishes.filter(dish => dish.id === markerId)[0];

    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "¡Este platillo no está disponible hoy!",
        timer: 2500,
        buttons: false
      });
    } else {
       // Cambiar el tamaño del modelo a su escala inicial
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      model.setAttribute("visible",true)
      var ingr=document.querySelector(`#main-plane-${dish.id}`)
      ingr.setAttribute("visible",true)
      var pri=document.querySelector(`#price-plane-${dish.id}`)
      pri.setAttribute("visible",true)

      // Cambiar la visibilidad del botón div
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      // Usar eventos de clic
      ratingButton.addEventListener("click", function() {
        swal({
          icon: "warning",
          title: "Calificar platillo",
          text: "Procesando calificación"
        });
      });

      orderButtton.addEventListener("click", () => {
        /*REEMPLAZAR COMENTARIOS Y AÑADIR AQUÍ EL CÓDIGO PARA LLAMAR A handleOrder()
        
        
        
        */

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "¡Gracias por tu orden!",
          text: "¡Recibirás tu orden pronto!",
          timer: 2000,
          buttons: false
        });
      });
    }
  },
  handleOrder: function(tNumber, dish) {
    firebase.collection("tables")
    .doc(tNumber)
    .get()
    .then(doc=>{
      var details=doc.data()
      if(details["current_orders"][dish.id]){
        details["current_orders"][dish.id]["quantity"]+=1
        var currentQuantity=details["current_orders"][dish.id]["quantity"]
        details["current_orders"][dish.id]["subtotal"]=currentQuantity*dish.price
      }else{
        details["current_orders"][dish.id]={
          item:dish.nombre,
          price:dish.price,
          quantity:1,
          subtotal:dish.price*1
        }
      }
    })
  },

  getDishes: async function() {
    return await firebase
      .firestore()
      .collection("platillos")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    // Cambiar la visibilidad del botón div
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});