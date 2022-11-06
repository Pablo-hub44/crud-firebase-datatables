// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
$(document).ready(function() {
    const config = {
        apiKey: "AIzaSyCguoe6bDJ7VFhypXifzuHmMj5PPk1I2mY",
        authDomain: "crud-d7389.firebaseapp.com",
        databaseURL: "https://crud-d7389-default-rtdb.firebaseio.com",
        projectId: "crud-d7389",
        storageBucket: "crud-d7389.appspot.com",
        messagingSenderId: "204690018229",
        appId: "1:204690018229:web:1c06c3135e1e1dd30753fc",
        measurementId: "G-VF1D4MVYV5"
    };
    // Initialize Firebase
    firebase.initializeApp(config);
    // firebase.analytics();

    var filaEliminada; //para capturar la fila eliminada
    var filaEditada; //para capturar la fila editada

    const db = firebase.database(); // instanciamos(vamos a utilizar todas las propiedades de la base de datos que nos brinda firebase ) a la base de datos
    var coleccionProductos = db.ref().child("productos"); //nuestra tabla productos

    //creamos constantes para los iconos de editar y borrar
    const iconoEditar = '<i class="material-icons">edit</i>'
    const iconoBorrar = '<i class="material-icons">delete</i>'

    var dataSet = []; //array para guardar los valores de los campos inputs del form
    var table = $('#tablaProductos').DataTable({
        pageLength: 5, //5 filas
        lengthMenu: [
            [5, 10, 20, -1],
            [5, 10, 20, 'Todos']
        ], //opciones de mostrar registros
        data: dataSet,
        columnDefs: [{
                targets: [0],
                visible: false, //ocultamos la columna de id que es la [0] la de id , no la de codigo
            },
            {
                targets: -1,
                defaultContent: "<div class='wrapper text-center'><div class='btn-group'><button class='btn btn-primary btn-sm btnEditar' data-toggle='tooltip' title='Editar'>" + iconoEditar + "</button><button class='btn btn-danger btn-sm btnBorrar' data-toggle='tooltip' title='Borrar'>" + iconoBorrar + "</button></div></div>"
            }
        ],
        //para cambiar el lenguaje a español
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Ultimo",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
            "sProcessing": "Procesando...",
        }
    });


    //eventos de firebase
    //CHILD_ADDED -AGREGAMOS ALGO
    coleccionProductos.on('child_added', datos => {
        //console.log(datos); // mostramos los datos de la coleccion desde firebase
        //console.log(datos.key); //mostramos las claves (los ids autogenerados) desde firebase
        dataSet = [datos.key, datos.child("codigo").val(), datos.child("descripcion").val(), datos.child("cantidad").val()];
        table.rows.add([dataSet]).draw(); // dibujame esa fila

    });

    //CHILD_CHANGED -MODIFICAMOS ALGO DE LA DB
    coleccionProductos.on('child_changed', datos => {
        dataSet = [datos.key, datos.child("codigo").val(), datos.child("descripcion").val(), datos.child("cantidad").val()];
        table.rows(filaEditada).data(dataSet).draw(); // dibujame esa fila
    });

    //CHILD_REMOVES -BORRAMOS ALGO
    coleccionProductos.on('child_removed', function() {
        table.row(filaEliminada.parents('tr')).remove().draw(); // hemos capturado filaeliminada

    });

    //Formulario de nuevo y edicion
    $("#form1").submit(function(e) {
        e.preventDefault();
        let id = $.trim($("#id").val());
        let codigo = $.trim($("#codigo").val());
        let descripcion = $.trim($("#descripcion").val());
        let cantidad = $.trim($("#cantidad").val());

        let idFirebase = id;
        if (idFirebase == '') {
            idFirebase = coleccionProductos.push().key;
        };
        data = { codigo: codigo, descripcion: descripcion, cantidad: cantidad };
        actualizacionData = {};
        actualizacionData[`/${idFirebase}`] = data;
        coleccionProductos.update(actualizacionData);
        id = '';
        $('#form1').trigger("reset"); // limpiamos los campos del formulario
        $('#modalNuevoedicion').modal('hide');
    });

    //programacion de los botones
    //boton Nuevo
    $('#btnNuevo').click(function() {
        $('#id').val('');
        $('#codigo').val('');
        $('#descripcion').val('');
        $('#cantidad').val('');
        $("#form1").trigger("reset");
        $('#modalNuevoedicion').modal('show');
    });
    //boton editar
    $('#tablaProductos').on("click", ".btnEditar", function() {
        filaEditada = table.row($(this).parents('tr')); //table hace referencia a toda la instancia de datatables
        //console.log(filaEditada);
        let fila = $('#tablaProductos').dataTable().fnGetData($(this).closest('tr'));
        let id = fila[0];
        console.log(filaEditada);
        let codigo = $(this).closest('tr').find('td:eq(0)').text();
        let descripcion = $(this).closest('tr').find('td:eq(1)').text();
        let cantidad = $(this).closest('tr').find('td:eq(2)').text();
        $('#id').val(id);
        $('#codigo').val(codigo);
        $('#descripcion').val(descripcion);
        $('#cantidad').val(cantidad);
        $('#modalNuevoedicion').modal('show');

    });
    //boton borrar
    $('#tablaProductos').on("click", ".btnBorrar", function() {
        filaEliminada = $(this); // captura la fila eliminada para pasarla al evento CHILD_REMOVED
        Swal.fire({ //con este codigo llamamos a sweetalert2
            title: '¿Esta seguro de borrar este registro?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Borrar'
        }).then((result) => { //si el result se confirma va a borrar
            if (result.value) {
                let fila = $('#tablaProductos').dataTable().fnGetData($(this).closest('tr'));
                let id = fila[0];
                db.ref(`productos/${id}`).remove(); // eliminamos el producto de firebase
                //le mostramos un mensaje sobre la eliminacion
                Swal.fire(
                    'Eliminado',
                    'El registro ha sido borrado.',
                    'success'
                )
            }

        })
    });

});