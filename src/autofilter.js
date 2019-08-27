var autofilter = (function(my){
    my.column = {};
    my.row = {};
    // Add topics => callbacks to parent table
    my.register = function(table){
        // Build model on first registration, skip otherwise
        if ($.isEmptyObject(my.columns)){
            my.column = build_column_modal();
            my.row = build_row_modal();
        }
        // table = Component
        table.subscribe({
            'autofilter: show': function(){
                var data = [];
                this._dt.columns().every(function(){
                    data.push({
                        'name': $(this.header()).text()
                        ,'filter': $(this.header()).hasClass('table-active') ? 1 : 0
                        ,'pt_index': this.index()
                    });
                });
                this.send('table: columns', data);
            }
            ,'autofilter: new filter': function(data){
                var ucount = [];
                this._dt.column(data.pt_index, {search:'applied})
                    .data().each(function(i)){
                        ucount.hasOwnProperty(i) ? ucount[i]++ : ucount[i]=1;
                    });
                var udata = [];
                for (var k in ucount){
                    if (ucount.hasOwnProperty(k)){
                        udata.push({'value': k, 'count': uncount[k]});
                    }
                }
                this.send('table: rows', udata);
            }
            ,'autofilter: remove filter': function(data){
                var hdr = $(this._dt.column(data.pt_index).header());
                hdr.removeClass('table-active');
                this._dt.column(data.pt_index).search("").draw();
            }
            ,'autofilter: apply filter': function(info){
                // info = {data, search_term}
                var pt_index = info.data.pt_index;
                var search_term = info.search_term;
                var hdr = $(this._dt.column(pt_index).header());
                hdr.addClass('table-active');
                this._dt.column(pt_index)
                    .search(search_term, true, false, false)
                    .draw();
            }
        });
    }
    
    function build_column_modal(){
        var table = Tag('table', {'class': 'table table-bordered'});
        // First define table Component, then add to modal later
        table.subscribe({
            'table: columns': function(columns){
                this._dt.clear().rows.add(columns).draw();
            }
            ,'autofilter: apply filter': function(){
                var data = this._dt.row({selected: true}).data();
                data.filter = 1;
                this._dt.row({selected: true}).data(data).draw();
                this._dt.rows().deselect();
            }
            ,'autofilter: cancel filter': function(){
                this._dt.rows().deselect();
            }
            ,'autofilter: remove filter': function(){
                var data = this._dt.row({selected: true}).data();
                data.filter = 0;
                this._dt.row({selected: true}).data(data).draw();
                this._dt.rows().deselect();
            }
        });
        // Here we build and add table to modal
        var modal = build_modal('Column Filters', table, init_column_DataTable);
        modal.subscribe({'autofilter: show', function(){ $(this.node).modal('show'); });
        return modal;
    }
 
    function build_row_modal(){
        var table = Tag('table',{'class': 'table table-striped table-bordered'});
        table.subscribe({
            'table: rows: function(data){
                this._dt.clear().rows.add(data).draw();
            }
            ,'autofilter: confirm filter': function(data){
                var vals = [];
                var val = '';
                this._dt.rows().every(function(){
                    if ($(this.node()).hasClass('selected')){
                        val = this.data().value.toString()
                            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // black magic
                        vals.push(val);
                    }
                });
                var search_term = '^'+vals.join('$|^')+'$';
                this._dt.search("");
                var info = {'data': data, 'search_term': search_term};
                this.send('autofilter: apply filter', info);
            }
        });
        var modal = build_modal('Row Filters', table, init_row_DataTable, Buttons());
        modal.subscribe({
            'autofilter: new filter': function(){ $(this.node).modal('show') }
            ,'autofilter: cancel filter': function(){ $(this.node).modal('hide') }
            ,'autofilter: apply filter': function(){ $(this.node).modal('hide') }
        });
    }
    
    function Buttons(){
        var ok = new Component({tag: 'button', _:'Apply', cls:'btn btn-primary'});
        ok.subscribe({'autofilter: new filter', function(data){ this._data = data; } });
        ok.on({'click': function(){ this.send('autofilter: confirm filter', this._data); } });
        var cancel = new Component({tag: 'button', _:'Cancel', kv:{
            'class': 'btn btn-secondary'
            ,'data-dismiss': 'modal'
        }});
        cancel.on({'click': function(){ this.send('autofilter: cancel filter'); } });
        return [ok, cancel];
    }
    
    function build_modal(title, dt, dt_builder, footer){
        // Alias "add" method
        Component.prototype._ = Component.prototype.add
        var title = new Component({tag:'h5', cls:'modal-title', _:title});
        var close = Tag('button', {
            'type': 'button'
            ,'class': 'close'
            ,'data-dismiss': 'modal'
        })._(new Component({'tag':'span', _:'x'});
        var modal = Div('modal', {tabindex: -1, role: 'dialog'})
            ._(Div('modal-dialog', {role: 'document'})
                ._(Div('modal-content')
                    ._(Div('modal-header')._([title, close]))
                    ._(Div('modal-body')._(dt))
                    ._(footer ? Div('modal-footer')._(footer) : [])
                )
            );
        dt_builder.bind(dt)();
        return modal;
    }
    
    function init_column_DataTable(){
        var self = this;
        self._dt = $(self.node).DataTable({
            autoWidth: true
            ,columns: [
                {data: 'name', title: 'Column', width: '80%'}
                ,{data: 'filter', title: 'Filter', width: '20%'
                    ,render: function(data, type, row, meta){
                        return data ? 
                            '<button class="btn btn-primary">On</button>'
                            : '<button class="btn btn-secondary">Off</button>'
                    }
                }
                ,{data: 'pt_index', visible: false}
            ]
            ,dom: "<'row'<'col-sm-12 col-md-12'f>>"
                +"<'row'<'col-sm-12't>>"
            ,paging: false
            ,scrollY: '520px'
            ,select: { style: 'single', selector: 'td:not(:first-child)'}
        });
        self._dt.on('select', function(e, dt, type, index){
            var data = self._dt.row(index).data();
            data.filter ?
                self.send('autofilter: remove filter', data)
                : self.send('autofilter: new filter', data);
        });
    }
    
    function init_row_DataTable(){
        var self = this;
        self._dt = $(self.node).DataTable({
            buttons: [{
                className: 'selectnone'
                ,extend: 'selectNone'
                ,text: 'Deselect'
                ,action: function(e){
                    e.preventDefault(): // really?
                    self._dt
                        .rows({search: 'applied'})
                        .nodes()
                        .to$()
                        .removeClass('selected');
                }
            },{
                className: 'selectall'
                ,extend: 'selectAll'
                ,text: 'Select'
                ,action: function(e){
                    e.preventDefault(): // really?
                    self._dt
                        .rows({search: 'applied'})
                        .nodes()
                        .to$()
                        .addClass('selected');
                }
            }]
            ,columns: [
                {data: 'value', title: 'Value'}
                ,{data: 'count', title: 'Count'}
            ]
            ,dom: "<'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'B>>"
                +"<'row'<'col-sm-12't>>"
                +"<'row'<'col-sm-12'i>>"
            ,lengthChange: 'false'
            ,paging: false
            ,scrollY: '520px'
            ,select: { 
                style: 'multi'
                ,selector: 'td:first-child'
            }
        });
    }
    // Helpers
    function Tag(name, tag_kv){
        return new Component({tag: name, kv: tag_kv||{}});
    }
    function Div(cls, div_kv){
        return new Component({'tag': 'div', 'cls': cls, 'kv': tag_kv||{}});
    }
    return my; // export module
})(autofilter || {});
