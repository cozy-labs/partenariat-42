var BaseView = require('../../lib/base_view');
var app = require('../../application');

var colorSet = require('../../helper/color_set');

/*
 * View wiche manage the editing for an update or a creation of a view
 * I make the both in the same class because it's exactly the same data to
 * manage.
 *
 * It's an update when this.count is defined, so we update this count else if we
 * find no count it's a creation.
 */
var CountEditorBase = BaseView.extend({
  id: 'count-editor-screen',


  /*
   * Add a listener in the changes of the input of name
   */
  afterRender: function () {
    this.$('#input-name')[0].addEventListener('change', (function(_this) {
      return function (event) {_this.checkCountName(event);};
    })(this));
    if (this.count !== null && this.count.get('isPublic') == true) {
      this.setPublic();
      this.$('#input-public').attr('checked');
    }
  },



  /*
   * Check if the count name is valable. It can't match with any of the other
   * count because that would create somes conflics in the url managements (we
   * find the counts by the name). For now we check the archive.
   * TODO: move the archive finding and url management to id
   */
  checkCountName: function (event) {
    var countName = event.target.value;

    // Check the count collection
    var nameIsTaken = window.countCollection.find(function (elem) {
      if (elem.get('name')== countName) {
        return true;
      }
      return false;
    });

    // Check the archive collection
    if (nameIsTaken === undefined || nameIsTaken === null) {
      var nameIsTaken = window.archiveCollection.find(function (elem) {
        if (elem.get('name')== countName) {
          return true;
        }
        return false;
      });
    }

    var inputGrp = this.$('#input-name-grp');
    // If name is tacken I add an alert
    if (nameIsTaken !== null && nameIsTaken !== undefined) {
      if (this.nameIsUsed === false) {
        inputGrp.addClass('has-error');
        inputGrp.append('<div id="name-used" class="alert alert-danger" role="alert">Name already use</div>');
        this.nameIsUsed = true;
      }
    } else {
      // Else we set the count name
      if (this.nameIsUsed === true) {
        this.$('#name-used').remove();
        inputGrp.removeClass('has-error');
        this.nameIsUsed = false;
      }
      return countName;
    }
  },


    errorMessage: function (msg) {
      this.$('#alert-zone').append('<div class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert">&times;</a>'+msg+'</div>');
    },
});

module.exports = CountEditorBase;
