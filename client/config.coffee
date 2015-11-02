exports.config =
    # Edit the next line to change default build path.
    paths:
        public: 'public'

    files:
        javascripts:
            # Defines what file will be generated with `brunch generate`.
            defaultExtension: 'js'
            # Describes how files will be compiled & joined together.
            # Available formats:
            # * 'outputFilePath'
            # * map of ('outputFilePath': /regExp that matches input path/)
            # * map of ('outputFilePath': function that takes input path)
            joinTo:
                'javascripts/app.js': /private/
                'javascripts/app_public.js': /public/
                'javascripts/vendor.js': /^vendor/
            # Defines compilation order.
            # `vendor` files will be compiled before other ones
            # even if they are not present here.
            order:
                before: [
                    'vendor/javascripts/console-helper.js',
                    'vendor/javascripts/jquery-2.1.1.min.js',
                    'vendor/javascripts/underscore-1.6.0.min.js',
                    'vendor/javascripts/backbone-1.1.2.min.js',
                    'vendor/javascripts/bootstrap-3.1.1.min.js',
                ]

        stylesheets:
            defaultExtension: 'styl'
            joinTo: 'stylesheets/app.css'
            order:
                before: []
                after: []
        templates:
            defaultExtension: 'jade'
            joinTo:
                'javascripts/app_public.js': /public/
                'javascripts/app.js': /private/

