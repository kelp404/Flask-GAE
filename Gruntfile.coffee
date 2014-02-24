module.exports = (grunt) ->
    # -----------------------------------
    # Options
    # -----------------------------------
    grunt.config.init
        compass:
            source:
                options:
                    sassDir: './application/static/scss'
                    cssDir: './application/static/css'
                    outputStyle: 'compressed'

        coffee:
            source:
                files:
                    './application/static/javascript/site.js': ['./application/static/coffeescript/*.coffee']

        watch:
            compass:
                files: ['./application/static/scss/*.scss']
                tasks: ['compass']
                options:
                    spawn: no
            coffee:
                files: ['./application/static/coffeescript/*.coffee']
                tasks: ['coffee']
                options:
                    spawn: no

    # -----------------------------------
    # register task
    # -----------------------------------
    grunt.registerTask 'dev', ['watch']

    # -----------------------------------
    # Plugins
    # -----------------------------------
    grunt.loadNpmTasks 'grunt-contrib-compass'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-watch'