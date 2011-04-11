function ManageVocabsWidget(manager){
	this._prefixesManager = manager;
}

ManageVocabsWidget.prototype.show = function(){
	var self = this;
    var frame = DialogSystem.createDialog();
    
    frame.width("450px");
    
	var header = $('<div></div>').addClass("dialog-header").text("List of defined prefixes").appendTo(frame);
    self._body = $('<div></div>').addClass("dialog-body").appendTo(frame);
    var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);
    
    self.renderBody();
	var level = DialogSystem.showDialog(frame);
	
	$('<button></button>').addClass('button').html("&nbsp;&nbsp;Done&nbsp;&nbsp;").click(function() {
    	DialogSystem.dismissUntil(level - 1);
    	self._prefixesManager._showPrefixes();
    }).appendTo(footer);
};

ManageVocabsWidget.prototype.renderBody = function(){
	var self = this;
	var addPrefixSpan = $('<span/>').html($('<a/>').text('Add Prefix').attr('href','#').click(function(e){
		e.preventDefault();
		self._prefixesManager._addPrefix(false,false,function(){self.renderBody();});
	}));
	var table = $('<table></table>').addClass('rdf-prefixes-table');
    table.append($('<tr>').addClass('rdf-table-even').append($('<th/>').text('Prefix')).append($('<th/>').text('URI')).append($('<th/>').text('Delete')));
    var getDeleteHandler = function(name){
    	return function(e){
    		e.preventDefault();
    		dismissBusy = DialogSystem.showBusy('Deleting prefix ' + name);
			$.post('/command/rdf-extension/remove-prefix',{'name':name,'project':theProject.id},function(data){
				dismissBusy();
				if(data.code==='error'){
					//TODO
				}else{
					self._prefixesManager._removePrefix(name);
					self.renderBody();
				}
			});
    	} 
    };
	for(var i=0;i<self._prefixesManager._prefixes.length;i++){
		var name =self._prefixesManager._prefixes[i].name;
		var delete_handle = $('<a/>').text('delete').attr('href','#').click(getDeleteHandler(name));
		var tr = $('<tr/>').addClass(i%2==1?'rdf-table-even':'rdf-table-odd')
							.append($('<td>').text(self._prefixesManager._prefixes[i].name))
							.append($('<td>').text(self._prefixesManager._prefixes[i].uri))
							.append($('<td>').html(delete_handle));
		table.append(tr);
	}
	self._body.empty().append(addPrefixSpan).append(table);
};
