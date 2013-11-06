
/*
 * GET home page.
 */

//извиква се, когато потребителят отиде на localhost:55555
exports.index = function(req, res){
  res.render('index', { title: 'To Do App' });
};

//извиква се, когато потребителят отиде на localhost:55555/todos
exports.todos = function(db) {
    return function(req, res) {
    	//достъпва се колекцията todos на базата todo
    	var todos = db.get('todos');
    	//поискват се всички записи от колекцията. при нужда винаги можете да укажете условия за търсене и/или
    	//условия за показване на полета по стандартния начин, напр. todos.find({priority:{$gt:5}},{priority:1,content:1}, function...)
    	//функцията се извиква при връщане на резултат като самият резултат се пази във втората променлива docs (бел. може да се кръсти по ваш избор)
    	todos.find({},{}, function(e, docs) {
			//резултатът, който се пази в променливата docs се праща като стойност на полето todos. Посредством res.render('todos' .. обектът дефиниран
			//като втори параметър се изпраща на todos.jade 
			res.render('todos', {
               "todos" : docs
        	});
    	});
}};

//извиква се, когато потребителят отиде на localhost:55555/add
exports.add = function(db){
	return function(req, res){
		
		//параметрите се взимат от заявката, която изглежда по следния начин:
		//localhost:55555/add?content=[NEW_CONTENT]&priority=[NEW_PRIORITY]
		var newContent = req.query.content;
		var newPriority = req.query.priority;

		//таблицата todos се взима по същия начин
		var todos = db.get('todos');
		//извикването на insert и сходно на това, което имате при работа с mongo shell-a, като отново трябва да се зададе
		//callback функция, която се извиква при връщане на резултат от заявката
		todos.insert({
			"content":newContent, "priority":newPriority
		}, function(err, doc){
			if (err)
			{//при върната грешка в случая изкарваме съобщение в лога, че добавянето не се е извършило
				console.log("couldn't add the todo");
			} else {
				//иначе отиваме на /todos, за да видим резултата от добавянето на todo-то
				res.redirect("todos");
				res.location("todos");
			}
		});
	}
}

//извиква се, когато потребителят отиде на localhost:55555/remove
exports.remove = function(db){
	return function(req, res){
		
		//параметрите се взимат от заявката, която изглежда по следния начин:
		//localhost:55555/remove?id=[TO_DO_ID]
		var todoStringId = req.query.id;

		//тъй като документът за триене ще се намери по _id трябва да преобразуваме низа, който сме получили като параметър към ObjectId
		var mongo = require('mongodb');
		var todoObjectId = new mongo.ObjectID(todoStringId);

		//аналогично на remove
		var todos = db.get('todos');
		todos.remove({
			"_id":todoObjectId
		}, function(err, doc){
			if (err)
			{
				console.log("couldn't delete the todo");
			} else {
				res.redirect("todos");
				res.location("todos");
			}
		});
	}
}

//извиква се, когато потребителят отиде на localhost:55555/edit
exports.edit = function(db) {
    return function(req, res) {

		//параметрите се взимат от заявката, която изглежда по следния начин:
		//localhost:55555/edit?id=[TO_DO_ID]&newcontent=[NEW_CONTENT]&newpriority=[NEW_PRIORITY]
        var idString = req.query.id;
        var newContent = req.query.newcontent;
        var newPriority = req.query.newpriority;

        //подобно на remove създаваме ObjectId по подаден низ
        var mongo = require('mongodb');
        var objectId = new mongo.ObjectID(idString);
        
        var collection = db.get('todos');
		collection.update({
            "_id" : objectId
        }, {
        	$set: {"content":newContent,"priority":newPriority}
        }, 
        function (err, doc) {
            if (err) {
                res.send("Could not update the todo");
            }
            else {
                res.redirect("todos");
                res.location("todos");
            }
        });

    }
}