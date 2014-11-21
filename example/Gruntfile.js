module.exports = function(grunt) {


grunt.initConfig({
    'http-server':
	  'dev' {
				{	
                // the server root directory
                root: './',
                port: 8282,
                host: "127.0.0.1",
                cache: 1000,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",

                //wait or not for the process to finish
                runInBackground: true
				}
			}
});

grunt.loadNpmTasks('grunt-http-server');

};