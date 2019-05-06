var userCreate = function(){

    function create (){

        const body = $('#form-register').serialize();

        Util.request('http://localhost:3000/user/create', 'POST', { body } , 'JSON', function(data){
            //put code redict to next step
        }, function(req, status, err){
            if(req.status === 409){
                if(req.responseJSON && req.responseJSON.data){
                    $.each(req.responseJSON.data, function(index, message){
                        $('#message').append(`<div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${message.msg}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                        `);
                    });
                }
            }
        });
    };

    return { create }
}();