let Util = function(){

    function request(endpoint, type, param, dataType, callbackSuccess){
        
        $.ajax({
            url: endpoint, 
            type: type,
            data: param, 
            dataType: dataType, 
            success: function(data){
                callbackSuccess(data);
            }, error: function(req, status, error){
                console.log('ERRRRRRORRRR', error);
            }
        });
    };

    return { request }

}();