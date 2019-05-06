let Util = function(){

    function request(endpoint, type, param, dataType, callbackSuccess, callbackError){
        
        $.ajax({
            url: endpoint, 
            type: type,
            data: param, 
            dataType: dataType, 
            success: function(data){
                callbackSuccess(data);
            }, error: function(req, status, error){
                callbackError(req, status, error);
            }
        });
    };

    return { request }

}();