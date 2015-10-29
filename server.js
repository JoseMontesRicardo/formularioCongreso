var 	express 	= require('express'),
	swig 		= require('swig'),
	server 	= express(),
	bodyParser 	= require('body-parser'),
	mysql		= require('mysql'),
	nodemailer 	= require('nodemailer'),
	session  	= require('express-session');

server.use( bodyParser() )
server.engine('html', swig.renderFile)
server.set('view engine', 'html')
server.set('views', './app/views')
server.use(session({
   	secret: 'Mojuvi critano',
   	resave: false,
   	saveUninitialized : false
}));
swig.setDefaults({
	cache : false
});

server.use(express.static(__dirname + '/public'))

var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'congreso'
});

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'pastoraljuvenilmonteria15@gmail.com',
        pass: 'pastoral2015'
    }
});

var isLoggIn = function ( req, res, next ){
	if (!req.session.username){
		res.redirect('/loggin')
		return
	}
	next()
}

var sendmail = function(mail, nombre){
	var mailOptions = {
	    from: 'pastoraljuvenilmonteria15@gmail.com', // sender address
	    to: mail, // list of receivers
	    subject: 'Confirmacion de Registro', // Subject line
	    text: 'Felicidades usted se registro con exito!!!',// plaintext body
	    html: '<h1 style="color: blue; text-align: center; font-size: 3em">Registro Exitoso</h1>\n<p style="text-align: center; font-size: 2em; text-align:justify"> coordial saludo '+nombre+', a buena hora has quedado registrado  en nuestra base de datos para asistir al <strong>XlX congreso Diocesano de Jovenes.</strong> cualquier inquietud puedes escribir a este correo.</p>' // html body
	}
	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log('Message sent: ' + info.response);

	})
}

server.get('/form', function (req, res){
	res.render('formDown')
})

/*server.post('/add', function (req, res){
	var object = req.body
	conn.query( "insert into registrados set ?", object, function (error, results){
		//debugger
		if (error){
			//throw error;
			if (error.code == "ER_DUP_ENTRY")
			{
				res.render('message',{messageError: 'ERROR: ya existe el usuario '+ req.body.Correo})
			} else {
				res.render('message',{messageError:'ERROR intentalo de Nuevo'})
			}
			//res.render('message', { user_session: req.session.username, mensajeError: 'ERROR: '+error, mensaje: '' })
		} else {
			sendmail(object.Correo, object.Nombres)
			res.render('message', {message: 'Registro Correcto!', alert:"Felicidades!, se ha enviado un correo a la direccion " + object.Correo})
		}//res.render('message',{  user_session: req.session.username, mensaje: 'El Usuario: '+object.var_4+' '+object.var_6+' se agrego Correctamente!!', mensajeError: '' });
	})
	//debugger
})*/

server.get('/Registrados', isLoggIn, function (req, res){
	conn.query('select * from registrados ORDER BY Mojuvi ASC', function (error, rows, fields){
		res.render('users', {array: rows})
	})
})

server.post('/Inloggin', function (req, res){
	conn.query('select * from users where (usuario = "'+req.body.Correo+'" && pass = "'+req.body.Pass+'")', function (error, rows, fields){
	if ( error ){
		//res.redirect('/loggin')
		res.send('error'+error)
	} else if ( rows[0] === undefined ) {
		res.redirect('/loggin')
	} else {
		req.session.username = rows[0].usuario
		req.session.password = rows[0].pass
		res.redirect('/Registrados')
	}
	})
})

server.get('/loggout', function (req, res){
	req.session.destroy()
	res.redirect('/loggin')
})

server.get('/loggin', function (req, res){
	res.render('loggin')
})

server.use(function(req, res){
	res.status(404).send('notfound')
})


 server.listen(4000, function(){console.log('server runnig on port 3000')})