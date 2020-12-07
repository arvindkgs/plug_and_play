const echoPostRequest = {
  url: pm.environment.get('cluster-url')+'/iam/auth/token',
  method: 'POST',
  header: 'Content-Type:application/json',
  body: {
    mode: 'application/json',
    raw: JSON.stringify(
        {
        	username:pm.environment.get('username'),
        	password:pm.environment.get('password'),
        	'grant-type':'client_credentials'
        })
  }
};

var getToken = true;

if(!pm.environment.get('clusterMap')){
    pm.environment.set('clusterMap', new Object());
}

var clusterMap = pm.environment.get('clusterMap');
if(!clusterMap.hasOwnProperty(pm.environment.get('cluster-url'))){
    clusterMap[pm.environment.get('cluster-url')] = new Object();
}
var credMap = clusterMap[pm.environment.get('cluster-url')];
if(!credMap.hasOwnProperty(pm.environment.get('username'))){
    credMap[pm.environment.get('username')] = new Object();
}
var tokens = credMap[pm.environment.get('username')];
if(!tokens.hasOwnProperty('currentAccessToken') ||
 !tokens.hasOwnProperty('accessTokenExpiry')){
     console.log('Token or expiry date are missing')
 }
 else if(tokens.accessTokenExpiry <= (new Date()).getTime()){
     console.log('Token is expired')
 }
 else{
     getToken = false;
    console.log('Token and expiry date are all good');
    pm.environment.set('currentAccessToken', tokens['currentAccessToken']);
    pm.environment.set('accessTokenExpiry', tokens['accessTokenExpiry']);
 }

if (getToken === true) {
    pm.sendRequest(echoPostRequest, function (err, res) {
    console.log(err ? err : res.json());
        if (err === null) {
            console.log('Saving the token and expiry date')
            var responseJson = res.json();
            // pm.environment.set('currentAccessToken', responseJson.access_token)
            tokens['currentAccessToken'] = responseJson.access_token;
    
            var expiryDate = new Date();
            expiryDate.setSeconds(expiryDate.getSeconds() + responseJson.expires_in);
            // pm.environment.set('accessTokenExpiry', expiryDate.getTime());
            tokens['accessTokenExpiry'] = expiryDate.getTime();
            pm.environment.set('currentAccessToken', tokens['currentAccessToken']);
            pm.environment.set('accessTokenExpiry', tokens['accessTokenExpiry']);
        }
    });
}
