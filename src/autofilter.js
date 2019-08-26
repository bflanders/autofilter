var autofilter = (function(my){
    my.column = {};
    my.row = {};
    // Register 
    my.register = function(table){
        if ($.isEmptyObject(my.columns)){
            my.column = build_column_modal();
            my.row = build_row_modal();
        }
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
        var modal = build_modal('Column Filters', table, init_column_DataTable);
        modal.subscribe({
            'autofilter: new filter': function(){ $(this.node).modal('show') }
            ,'autofilter: cancel filter': function(){ $(this.node).modal('hide') }
            ,'autofilter: apply filter': function(){ $(this.node).modal('hide') }
        });
        return modal;
    }
    
    function build_modal(title, dt, dt_builder, footer){
        // Alias
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
        dt_builder.bind(dt);
        return modal;
    }
    
    function init_
})(autofilter || {});
