var userIndex = function(){

    $(function(){

        Util.request('http://localhost:3000/payment', 'GET', null, 'JSON', function(data){

            $.each(data.data, function(index, value){
                value = JSON.parse(value);
                $('#table-list-payments > tbody:last-child')
                .append(`<tr><td>${value.Name}</td><td>${value.Description}</td><td>
                    ${value.Date}</td><td>${value.Value}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-primary">Primary</button>
                        <a href="${value.Imagelink}" target="_blank" class="btn btn-sm btn-link">Receipt</a>
                        <button type="button" class="btn btn-sm btn-info">Info</button>
                        <button type="button" class="btn btn-sm btn-danger">Danger</button>
                    </td></tr>`);
            });

            $('#table-list-payments').DataTable();
        });
    });

    return {  };

}();