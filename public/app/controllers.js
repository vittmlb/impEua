/**
 * Created by Vittorio on 16/08/2016.
 */


function ModalInstanceCtrl ($scope, $uibModalInstance) {

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}

angular
    .module('admin_panel')
    .controller('ModalInstanceCtrl', ModalInstanceCtrl);