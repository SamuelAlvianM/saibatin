<?php

namespace App\Http\Controllers\Fronts\Permohonans;

use App\Models\Fronts\Permohonans\Kelahiran1Model;
use App\Models\Fronts\Permohonans\Kelahiran2Model;
use App\Models\Fronts\Permohonans\KematianModel;
use App\Models\Fronts\Permohonans\PerkawinanModel;
use App\Models\Fronts\Permohonans\PerceraianModel;
use App\Models\Fronts\Permohonans\KedatanganModel;
use App\Models\Fronts\Permohonans\KIAModel;
use App\Models\Fronts\Permohonans\KKCetakUlangModel;
use App\Models\Fronts\Permohonans\KKNumpangModel;
use App\Models\Fronts\Permohonans\KKPerubahhanBiodataModel;
use App\Models\Fronts\Permohonans\KKPisahKKModel;
use App\Models\Fronts\Permohonans\KKTambahAnakModel;
use App\Models\Fronts\Permohonans\KonsolidasiUpdateDataModel;
use App\Models\Fronts\Permohonans\KTPELModel;
use App\Models\Fronts\Permohonans\PindahModel;
use App\Models\Fronts\Users\UsersModel;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Includes\OptionModel;
use App\Models\Includes\MenuModel;
use App\Quotation;
use Carbon\Carbon;
use Auth;
use DataTables;
use DB;
use File;
use Validator;


class PelayananController extends Controller
{   
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dalamprosesgetdata(Request $request)
    {
        $urlRoute   = $request->get('id');
        $key    = $request->get('key');

        $auth   = Auth::user();
        $sessid = $auth->id;
        $sessnik= $auth->user_nik;
        $sesskk = $auth->user_nokk;
        $sessulvid  = $auth->userlevel_id;
        $sesskodekel= $auth->kode_kel;
        $sesskodekec= $auth->kode_kec;

        $whr1   = '';
        $whr2   = '';
        $whr3   = '';
        $whr4   = '';
        $whr5   = '';
        $slct1  = '';
        if($sessnik):
            if($sessulvid==3):
                $whr1   = 'x1.created_by='.$sessid;
                $whr2   = '1=1';
                $whr3   = '1=1';
                $whr4   = '1=1';
                $whr5   = '1=1';
            elseif($sessulvid==41):
                $whr1   = 'x1.created_by='.$sessid;
                $whr2   = '1=1';
                $whr3   = '1=1';
                $whr4   = '1=1';
                $whr5   = '1=1';
                
                $slct1  = ', \'Normal\' as prioritas';
            elseif($sessulvid==2 || $sessulvid==4):
                $whr1   = '1=1';
                $whr2   = ($key==9)?'1=1':'x1.progress_status='.$key;
                $whr3   = '1=1';
                $whr4   = '1=1';
                $whr5   = '1=1';
                
                $slct1  = ', if(ifnull(y2.userlevel_id,\'\') in (2,4) or ifnull(y1.isEscalateToDinas,\'0\')=1,\'Diprioritaskan\',\'Normal\') as prioritas';
            endif;
        else:

        endif;

        $query  = Datatables::of(
            DB::query()
            ->selectRaw('z1.*')
            ->fromSub(
                function ($query) use($sessulvid,$whr1,$whr2,$whr3,$whr4,$whr5,$slct1) {
                    $query
                        ->selectRaw('
                            ifnull(y1.nomorPermohonan,\'-\') as nomorPermohonan
                            , ifnull(y1.jenisPermohonan,\'-\') as jenisPermohonan
                            , ifnull(y1.pemohonnik,\'-\') as pemohonnik
                            , ifnull(y1.pemohonkk,\'-\') as pemohonkk
                            
                            , ifnull(y1.prg_sts,\'-\') as prg_sts
                            , ifnull(y1.isEscalateToDinas,\'0\') as isEscalateToDinas
                            , ifnull(y1.cat,\'-\') as cat
                            , ifnull(y1.id,\'-\') as id
                            , ifnull(y1.jenisPermohonanTbl,\'-\') as jenisPermohonanTbl
                            , ifnull(y1.jenisPermohonanRoute,\'-\') as jenisPermohonanRoute
                            , ifnull(y1.biodatapemohonnik,\'-\') as biodatapemohonnik
                            , ifnull(y1.biodatapemohonkk,\'-\') as biodatapemohonkk
                            , '.$sessulvid.' as sessulvid
                            , ifnull(y2.userlevel,\'-\') as userlevel
                            , y1.created_by
                            , case
                            	when y1.prg_sts=2 then if(y1.isEscalateToDinas=1,concat(\'Eskalasi ke Opt. Dinas, Menunggu Verifikasi \',if(y1.isEscalateToDinas=1,\'opt. dinas\',ifnull(y2.userlevel,\'\'))),concat(\'Menunggu Verifikasi \',if(y1.isEscalateToDinas=1,\'opt. dinas\',ifnull(y2.userlevel,\'\'))))
                            	when y1.prg_sts=3 then if(y1.isEscalateToDinas=1,concat(\'Eskalasi ke Opt. Dinas, Proses Input SIAK \',if(y1.isEscalateToDinas=1,\'opt. dinas\',ifnull(y2.userlevel,\'\'))),concat(\'Proses Input SIAK \',if(y1.isEscalateToDinas=1,\'opt. dinas\',ifnull(y2.userlevel,\'\'))))
                            	when y1.prg_sts=1 then if(y1.isEscalateToDinas=1,concat(\'Eskalasi ke Opt. Dinas, Terverifikasi & Selesai\'),\'Terverifikasi & Selesai\')
                            	when y1.prg_sts=0 then if(y1.isEscalateToDinas=1,concat(\'Eskalasi ke Opt. Dinas, Ditolak\'),\'Ditolak\')
                            	else \'-\'
                            end as statusPermohonanSearch
                            '.$slct1.'
                        ')
                        ->fromSub(
                            DB::table('t_kelahiran_1 as x1')
                            ->selectRaw('
                                x1.nomorPermohonan
                                , \'Akta Kelahiran (Tidak Ada NIK)\' as jenisPermohonan
                                , x1.pemohon_nik as pemohonnik
                                , x1.pemohon_kk as pemohonkk
                                , x1.created_at as cat
                                , x1.progress_status as prg_sts
                                , x1.isEscalateToDinas
                                , x1.id
                                , \'kelahiran_1\' as jenisPermohonanTbl
                                , \'frtPermohonanAktaKelahiranNikBlmAda\' as jenisPermohonanRoute
                                , \'\' as biodatapemohonnik
                                , \'\' as biodatapemohonkk
                                , x1.created_by
                            ')
                            ->where([
                                ['status','=','1']
                            ])
                            ->whereRaw($whr1)
                            ->whereRaw($whr2)
                            ->whereRaw($whr3)
                            ->whereRaw($whr4)
                            ->unionAll(
                                DB::table('t_kelahiran_2 as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kelahiran_2\' as jenisPermohonanTbl
                                        , \'frtPermohonanAktaKelahiranNikAda\' as jenisPermohonanRoute
                                        , x1.biodata_anakNik as biodatapemohonnik
                                        , x1.biodata_Kk as biodatapemohonnik
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kematian as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Kematian\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kematian\' as jenisPermohonanTbl
                                        , \'frtPermohonanAktaKematian\' as jenisPermohonanRoute
                                        , x1.biodata_jenazahNik as biodatapemohonnik
                                        , x1.biodata_Kk as biodatapemohonnik
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kia as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Kartu Identitas Anak\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kia\' as jenisPermohonanTbl
                                        , \'frtPermohonanKIA\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_perkawinan as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Akta Perkawinan\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.aktaPerkawinan_nokksuami as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'perkawinan\' as jenisPermohonanTbl
                                        , \'frtPermohonanAktaNikah\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_perceraian as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Akta Perceraian\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.dataPerceraian_nokk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'perceraian\' as jenisPermohonanTbl
                                        , \'frtPermohonanAktaPerceraian\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_pindah as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'pindah\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'pindah\' as jenisPermohonanTbl
                                        , \'frtPermohonanPindah\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kedatangan as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Kedatangan\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kedatangan\' as jenisPermohonanTbl
                                        , \'frtPermohonanKedatangan\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_ktpel as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'KTP-El\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'ktpel\' as jenisPermohonanTbl
                                        , \'frtPermohonanKTPEL\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kk_tambahanak as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'KK Tambah Anak\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kktambahanak\' as jenisPermohonanTbl
                                        , \'frtPermohonanKKTambahAnak\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kk_pisahkk as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Pisah KK\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kkpisahkk\' as jenisPermohonanTbl
                                        , \'frtPermohonanKKPisahKK\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kk_numpang as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Numpang KK\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kknumpang\' as jenisPermohonanTbl
                                        , \'frtPermohonanKKNumpang\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kk_perubahanbiodata as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Perubahan Biodata KK\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kkperubahanbiodata\' as jenisPermohonanTbl
                                        , \'frtPermohonanKKPerubahanBiodata\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_kk_cetakulang as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Cetak Ulang\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'kkcetakulang\' as jenisPermohonanTbl
                                        , \'frtPermohonanKKCetakUlang\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            ->unionAll(
                                DB::table('t_konsolidasiupdatedata as x1')
                                    ->selectRaw('
                                        x1.nomorPermohonan
                                        , \'Konsolidasi Update Data\' as jenisPermohonan
                                        , x1.pemohon_nik as pemohonnik
                                        , x1.pemohon_kk as pemohonkk
                                        , x1.created_at as cat
                                        , x1.progress_status as prg_sts
                                        , x1.isEscalateToDinas
                                        , x1.id
                                        , \'konsolidasiupdatedata\' as jenisPermohonanTbl
                                        , \'frtPermohonanKonsolidasiUpdateData\' as jenisPermohonanRoute
                                        , \'\' as biodatapemohonnik
                                        , \'\' as biodatapemohonkk
                                        , x1.created_by
                                    ')
                                    ->where([
                                        ['status','=','1']
                                    ])
                                    ->whereRaw($whr1)
                                    ->whereRaw($whr2)
                                    ->whereRaw($whr3)
                                    ->whereRaw($whr4)
                            )
                            , 'y1'
                        )
                        ->leftJoinSub(
                            function ($query) {
                                $query
                                    ->from('users as x1')
                                    ->selectRaw('
                                        x1.id
                                        , x1.userlevel_id
                                        , case 
                                            when x1.userlevel_id=\'3\' then \'Opt. Desa\'
                                            when x1.userlevel_id=\'5\' then \'Pejabat Desa\'
                                            when x1.userlevel_id=\'41\' then \'Opt. Kecamatan\'
                                            when x1.userlevel_id=\'4\' then \'Opt. Dinas\' 
                                            when x1.userlevel_id=\'2\' then \'Administrator\'
                                            else \'-\'
                                        end as userlevel
                                    ')
                                ;
                            }, 'y2'
                            , function($join) {
                                $join->on('y1.created_by', '=', 'y2.id');
                            }
                        )
                        ->whereRaw($whr5)
                    ;
                }, 'z1'
            )
        )
        ->addColumn('lbluserlevel', function ($data) {
                $nik_pemohon   = UsersModel::find($data->created_by)->user_id;
                $result = '';
                $result = '<div><div>'.$data->userlevel.'</div><div class="font-family-kdamthmorpro font-dot65rem text-blue fw-bold text-shadow-white-5" onclick="pop(\'admPermohonanRiwayat\',\'riwayat\',\'permohonan - akun '.$nik_pemohon.'\',\'childx\',\'400\',false,false,\''.$data->created_by.'\')" style="letter-spacing: 1px;"><span class="cursor-pointer" style="border-bottom: 1px dashed blue;">Riwayat Akun</span></div></div>';

                return $result;
            }
        )
        ->addColumn('statusPermohonan', function ($data) {
            $result = '';

            if($data->prg_sts==2):      $bgcolor = '#ff9800';
            elseif($data->prg_sts==3):  $bgcolor = '#00bcd4';
            elseif($data->prg_sts==1):  $bgcolor = '#4caf50';
            elseif($data->prg_sts==0):  $bgcolor = '#ff4141';
            endif;

            $lblStatus  = '';
            $lblIcon    = '';
            if($data->prg_sts=='2'):
                $lblStatus  = '<div> Menunggu Verifikasi </div><div><i class="fas fa-book-reader fa-fw mr-1"></i> '.(($data->isEscalateToDinas==1)?'Opt. Dinas':$data->userlevel).'</div>';
            elseif($data->prg_sts=='3'):
                $lblStatus  = '<div> Proses Input SIAK </div><div><i class="fas fa-chalkboard-teacher fa-fw mr-1"></i> '.(($data->isEscalateToDinas==1)?'Opt. Dinas':$data->userlevel).'</div>';
            elseif($data->prg_sts=='1'):
                $lblStatus  = '<div><i class="fas fa-check fa-fw mr-1"></i> Terverifikasi & Selesai</div>';
            elseif($data->prg_sts=='0'):
                $lblStatus  = '<div><i class="fas fa-times fa-fw mr-1"></i> Ditolak</div>';
            else:
                $lblStatus  = '-';
            endif;
                
            if($lblStatus== '' || $lblStatus=='-'):
                $result = '-';
            else:
                $result = '
                    <div class="d-flex justify-content-center">
                        <div class="text-white font-dot7rem py-1 px-2 font-family-koulen mx-1 d-flex align-items-center" style="border-radius: 6px !important; padding-top: 4px; padding-bottom: 4px; border: 1px solid #fff; background-color: '.$bgcolor.'; letter-spacing: 1px; text-shadow: 0 0 #000;"><span>'.$lblStatus.'</span></div>
                    </div>
                ';
            endif;

            return $result;
        })
        ->addColumn('btnAction', function ($data) {
            $result = '-';
            if($data->sessulvid==2 || $data->sessulvid==4):
                if(($data->prg_sts==2 || $data->prg_sts==3)):
                    $result = '
                        <div class="d-flex justify-content-center">
                            <div class="text-white font-dot7rem font-family-koulen text-shadow-white-10 bg-blue mx-1 d-flex align-items-center justify-content-center cursor-pointer" onclick="pop(\''.$data->jenisPermohonanRoute.'_pop\', \'pelayanan\', \''.$data->jenisPermohonan.'\', \'parent\',\'750\',\''.$data->id.'\',\'pop\',\'prgs\',\''.$data->nomorPermohonan.'\'); ValidatePick(\''.$data->nomorPermohonan.'\');" style="padding-top: 4px; padding-bottom: 4px; border: 1px solid #fff; height: 30px; width: 30px; border-radius: 3px;"><i class="fas fa-edit fa-fw"></i></div>
                        </div>
                    ';
                endif;
            endif;

            return $result;
        })
        ->addColumn('btnEvidence', function ($data) {
                $result = '-';
                if($data->sessulvid==2 || $data->sessulvid==4):
                    if($data->prg_sts==1):
                        if (file_exists(base_path().'/../../uploads/'.$data->jenisPermohonanTbl.'/'.$data->nomorPermohonan.'/'.$data->nomorPermohonan.'.zip')):
                            $result = '
                                <div class="d-flex justify-content-center">
                                    <a class="font-dot7rem font-family-koulen text-shadow-white-10 bg-orange mx-1 d-flex align-items-center justify-content-center cursor-pointer" href="uploads/'.$data->jenisPermohonanTbl.'/'.$data->nomorPermohonan.'/'.$data->nomorPermohonan.'.zip" target="_blank" style="padding-top: 4px; padding-bottom: 4px; border: 1px solid #fff; color: #fff !important; height: 30px; width: 30px; border-radius: 3px;"><i class="fas fa-download fa-fw"></i></a>
                                    <div class="text-white font-dot7rem font-family-koulen text-shadow-white-10 mx-1 d-flex align-items-center justify-content-center cursor-pointer bg-red" onclick="pop(\'frtPermohonanPelayananDelEvid_pop\', \'pelayanan\', \''.$data->jenisPermohonan.'\', \'parent\',\'350\',\''.$data->id.'\',\'pop\',\'clean\',\''.$data->nomorPermohonan.'\');" style="padding-top: 4px; padding-bottom: 4px; border: 1px solid #fff; height: 30px; width: 30px; border-radius: 3px;"><i class="fas fa-trash fa-fw"></i></div>
                                </div>
                            ';
                        endif;
                    elseif($data->prg_sts==3):
                        if (file_exists(base_path().'/../../uploads/'.$data->jenisPermohonanTbl.'/'.$data->nomorPermohonan.'/'.$data->nomorPermohonan.'.zip')):
                            $result = '
                                <div class="d-flex justify-content-center">
                                    <a class="font-dot7rem font-family-koulen text-shadow-white-10 bg-orange mx-1 d-flex align-items-center justify-content-center cursor-pointer" href="uploads/'.$data->jenisPermohonanTbl.'/'.$data->nomorPermohonan.'/'.$data->nomorPermohonan.'.zip" target="_blank" style="padding-top: 4px; padding-bottom: 4px; border: 1px solid #fff; color: #fff !important; height: 30px; width: 30px; border-radius: 3px;"><i class="fas fa-download fa-fw"></i></a>
                                </div>
                            ';
                        endif;
                    endif;
                endif;

                return $result;
            }
        )
        ->rawColumns(['statusPermohonan','btnAction','btnEvidence','lbluserlevel'])
        ->toJson(); 

        return $query;
    }

    public function gettot() {
        $auth   = Auth::user();
        $sessid = $auth->id;
        $sessnik= $auth->user_nik;
        $sesskk = $auth->user_nokk;
        $sessulvid = $auth->userlevel_id;
        $sesskodekel= $auth->kode_kel;

        $whr1   = '';
        $whr2   = '';
        $whr3   = '';
        $whr4   = '';
        if($sessulvid==3):
            $whr1   = 'x1.created_by='.$sessid;
            $whr2   = '1=1';
            $whr3   = '1=1';
        elseif($sessulvid==41):
            $whr1   = 'x1.created_by='.$sessid;
            $whr2   = '1=1';
            $whr3   = '1=1';
        elseif($sessulvid==2 || $sessulvid==4):
            $whr1   = '1=1';
            $whr2   = ($key==9)?'1=1':'x1.progress_status='.$key;
            $whr3   = 'x1.isEscalateToDinas=1';
        endif;

        $data  = DB::query()
            ->selectRaw('y1.prg_sts, count(y1.nomorPermohonan) as plyn_tot')
            ->fromSub(
                DB::table('t_kelahiran_1 as x1')
                ->selectRaw('
                    x1.nomorPermohonan
                    , x1.progress_status as prg_sts
                ')
                ->where([
                    ['status','=','1']
                ])
                ->whereRaw($whr1)
                ->whereRaw($whr2)
                ->whereRaw($whr3)
                ->whereRaw($whr4)
                ->unionAll(
                    DB::table('t_kelahiran_2 as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kematian as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kk as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kia as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_perkawinan as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_perceraian as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_pindah as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kedatangan as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_ktpel as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kk_tambahanak as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kk_pisahkk as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kk_numpang as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kk_perubahanbiodata as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_kk_cetakulang as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ->unionAll(
                    DB::table('t_konsolidasiupdatedata as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , x1.progress_status as prg_sts
                        ')
                        ->where([
                            ['status','=','1']
                        ])
                        ->whereRaw($whr1)
                        ->whereRaw($whr2)
                        ->whereRaw($whr3)
                        ->whereRaw($whr4)
                )
                ,'y1'
            )
            ->groupBy('y1.prg_sts')
        ;

        $res= $data->get();

        return $res;
    }

    public function fetchDatas(Request $request)
    {   
        $key    = $request->input('key');
        $data   = OptionModel::find($key);
        $output = array(
            'val'   => $data->option_val
            ,'ket'  => $data->ket
            ,'sort' => $data->sort
            ,'sts'  => $data->status
        );

        echo json_encode($output);
    }

    public function delEvid(Request $request)
    {   
        $urlRoute   = $request->get('id');
        $key        = $request->get('key');
        $modal      = $request->get('modal');
        $prm1       = $request->get('prm1')?$request->get('prm1'):'';
        $prm2       = $request->get('prm2')?$request->get('prm2'):'';
        $prm3       = $request->get('prm3')?$request->get('prm3'):'';

        return view('fronts.permohonans.evidence', ['id'=>$urlRoute,'key'=>$key,'modal'=>$modal,'prm1'=>$prm1,'prm2'=>$prm2,'prm3'=>$prm3]);
    }

    public function delEvid_post(Request $request)
    {   
        $auth   = Auth::user();
        $sessid = $auth->id;
        $permohonanID   = $request->get('prm1');

        $output_error   = array();
        $output_success = array();
        $output_data    = array();
        $output_html    = array();

        if($auth):
            if($permohonanID):
                $permohonanGroup = substr($permohonanID,0,5);

                $QFindDataDB    = false;
                if($permohonanGroup=='AKL01'):       $QFindDataDB=Kelahiran1Model::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='AKL02'):   $QFindDataDB=Kelahiran2Model::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='AKM01'):   $QFindDataDB=KematianModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='AKW01'):   $QFindDataDB=PerkawinanModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='AKC01'):   $QFindDataDB=PerceraianModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='PKD01'):   $QFindDataDB=KedatanganModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KIA01'):   $QFindDataDB=KIAModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KKC01'):   $QFindDataDB=KKCetakUlangModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KKN01'):   $QFindDataDB=KKNumpangModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KKU01'):   $QFindDataDB=KKPerubahhanBiodataModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KKP01'):   $QFindDataDB=KKPisahKKModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KKT01'):   $QFindDataDB=KKTambahAnakModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KSL01'):   $QFindDataDB=KonsolidasiUpdateDataModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='KTP01'):   $QFindDataDB=KTPELModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                elseif($permohonanGroup=='PPD01'):   $QFindDataDB=PindahModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                endif;

                $permohonanType    = false;
                if($permohonanGroup=='AKL01'):       $permohonanType='kelahiran_1';
                elseif($permohonanGroup=='AKL02'):   $permohonanType='kelahiran_2';
                elseif($permohonanGroup=='AKM01'):   $permohonanType='kematian';
                elseif($permohonanGroup=='AKW01'):   $permohonanType='perkawinan';
                elseif($permohonanGroup=='AKC01'):   $permohonanType='perceraian';
                elseif($permohonanGroup=='PKD01'):   $permohonanType='kedatangan';
                elseif($permohonanGroup=='KIA01'):   $permohonanType='kia';
                elseif($permohonanGroup=='KKC01'):   $permohonanType='kkcetakulang';
                elseif($permohonanGroup=='KKN01'):   $permohonanType='kknumpang';
                elseif($permohonanGroup=='KKU01'):   $permohonanType='kkperubahanbiodata';
                elseif($permohonanGroup=='KKP01'):   $permohonanType='kkpisahkk';
                elseif($permohonanGroup=='KKT01'):   $permohonanType='kktambahanak';
                elseif($permohonanGroup=='KSL01'):   $permohonanType='konsolidasiupdatedata';
                elseif($permohonanGroup=='KTP01'):   $permohonanType='ktpel';
                elseif($permohonanGroup=='PPD01'):   $permohonanType='pindah';
                endif;

                if($QFindDataDB):
                    if($QFindDataDB->progress_status=='1'):
                        try {
                            $data = $QFindDataDB;
                            $data->evidenceDelete_status    = '1';
                            $data->evidenceDelete_by        = $sessid;
                            $data->evidenceDelete_date      = Carbon::now();
                            $updEvidence = $data->save();

                            if($updEvidence):
                                $delEvidFiles   = File::deleteDirectory(base_path().'/../../uploads/'.$permohonanType.'/'.$permohonanID);
                                if($delEvidFiles):
                                    $output_success[]   = 'Info: Berhasil menghapus evidence...';
                                else:
                                    $output_error[]   = 'Info: Harap refresh browser (N-07)';
                                endif;
                            else:
                                $output_error[] = 'Info: Data tidak berhasil diperbaharui (N-06)';
                            endif;
                        } catch(\Illuminate\Database\QueryException $ex){
                            $output_error[] = 'Info: Harap refresh browser (N-05)';
                        }
                    else:
                        $output_error[] = 'Info: Harap refresh browser (N-04)';
                    endif;
                else:
                    $output_error[] = 'Info: Harap refresh browser (N-03)';
                endif;
            else:
                $output_error[] = 'Info: Harap refresh browser (N-02)';
            endif;
        else:
            $output_error[] = 'Info: Harap refresh browser (N-01)';
        endif;

        $output = array('error' => $output_error,'success' => $output_success,'data' => $output_data,'html' => $output_html);
            echo json_encode($output);
    }

    public function verificationPermohonan(Request $request)
    {   
        $urlRoute   = $request->get('id');
        $key        = $request->get('key');
        $modal      = $request->get('modal');
        $prm1       = $request->get('prm1')?$request->get('prm1'):'';
        $prm2       = $request->get('prm2')?$request->get('prm2'):'';
        $prm3       = $request->get('prm3')?$request->get('prm3'):'';

        return view('fronts.permohonans.verification', ['id'=>$urlRoute,'key'=>$key,'modal'=>$modal,'prm1'=>$prm1,'prm2'=>$prm2,'prm3'=>$prm3]);
    }

    public function verificationPermohonan_post(Request $request)
    {   
        $auth   = Auth::user();
        $sessid = $auth->id;
        $sesskodekel = $auth->kode_kel;
        $sesskodekec = $auth->kode_kec;
        $permohonanID   = $request->get('prm1');

        $output_error   = array();
        $output_success = array();
        $output_data    = array();
        $output_html    = array();

        if($auth):
            if($permohonanID):
                $operatorKec_kontak = UsersModel::selectRaw('user_hp,max(user_id) as user_id')->where([['kode_kec',$sesskodekec],['userlevel_id','41'],['status','=','1']])->groupBy('user_hp')->get();
                if($permohonanID=='99'):
                    try {
                        $permohonanGroup    = ['Kelahiran1','Kelahiran2','Kematian','Perkawinan','Perceraian','Kedatangan','KIA','KKCetakUlang','KKNumpang','KKPerubahhanBiodata','KKPisahKK','KKTambahAnak','KonsolidasiUpdateData','KTPEL','Pindah'];
                        $permohonanKet      = ['Akta Kelahiran (Blm Ada NIK)','Akta Kelahiran (Ada NIK)','Akta Kematian','Akta Perkawinan','Akta Perceraian','Kedatangan Penduduk','Kartu Identitas Anak (KIA)','Cetak Ulang KK','KK Numpang','Perubahan Biodata KK','Pisah KK','KK Tambah Anak','Konsolidasi Update Data','KTP-El','Perpindahan Penduduk'];
                        for ($k=0; $k<count($permohonanGroup); $k++):
                            $ModelName  = 'App\Models\Fronts\Permohonans\\'.$permohonanGroup[$k].'Model';
                            ${'QUpd_'.$permohonanGroup[$k]}     = $ModelName::where([['kode_kel',$sesskodekel],['progress_status','2'],['verified_pejabatDesa_status','2']]);
                            ${'Data_'.$permohonanGroup[$k]}     = ${'QUpd_'.$permohonanGroup[$k]}->get();
                            if(count(${'Data_'.$permohonanGroup[$k]})>0):
                                ${'Upd_'.$permohonanGroup[$k]} = ${'QUpd_'.$permohonanGroup[$k]}->update(array('verified_pejabatDesa_status'=>1,'verified_pejabatDesa_by'=>$sessid,'verified_pejabatDesa_date'=>Carbon::now(),'verified_operatorKec_status'=>1,'verified_operatorKec_by'=>$sessid,'verified_operatorKec_date'=>Carbon::now()));
                                if(${'Upd_'.$permohonanGroup[$k]}>0):
                                    for ($j=0; $j<count(${'Data_'.$permohonanGroup[$k]}); $j++):
                                        $UsersData  = UsersModel::find(${'Data_'.$permohonanGroup[$k]}[$j]->created_by);
                                        
                                        $sendwamsg_pemohon  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan Disdukcapil\n\n# _*Ringkasan => ".${'Data_'.$permohonanGroup[$k]}[$j]->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet[$k]."\n  └ Dibuat Oleh : ".$UsersData->user_id."\n  └ Pemohon : ".${'Data_'.$permohonanGroup[$k]}[$j]->pemohon_nama."\n  └ Tgl Permohonan : ".${'Data_'.$permohonanGroup[$k]}[$j]->created_at."\n\n# _*Status => Dalam Proses*_ \n  └ Pejabat Desa : Terverifikasi"."\n  └ Operator Kecamatan : Terverifikasi"."\n  └ Operator Capil : Menunggu Verifikasi"."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                        $this->sendwa($sendwamsg_pemohon,${'Data_'.$permohonanGroup[$k]}[$j]->pemohon_hp);

                                        if(${'Data_'.$permohonanGroup[$k]}[$j]->pemohon_hp!=$UsersData->user_hp):
                                            $sendwamsg_operator  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan Disdukcapil\n\n# _*Ringkasan => ".${'Data_'.$permohonanGroup[$k]}[$j]->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet[$k]."\n  └ Dibuat Oleh : ".$UsersData->user_id."\n  └ Pemohon : ".${'Data_'.$permohonanGroup[$k]}[$j]->pemohon_nama."\n  └ Tgl Permohonan : ".${'Data_'.$permohonanGroup[$k]}[$j]->created_at."\n\n# _*Status => Dalam Proses*_ \n  └ Pejabat Desa : Terverifikasi"."\n  └ Operator Kecamatan : Terverifikasi"."\n  └ Operator Capil : Menunggu Verifikasi"."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                            $this->sendwa($sendwamsg_operator,$UsersData->user_hp);
                                        endif;

                                        for ($i=0; $i<count($operatorKec_kontak); $i++):
                                            if(${'Data_'.$permohonanGroup[$k]}[$j]->pemohon_hp!=$operatorKec_kontak[$i]['user_hp']): 
                                                $sendwamsg_operatorKec  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan Disdukcapil\n\n# _*Ringkasan => ".${'Data_'.$permohonanGroup[$k]}[$j]->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet[$k]."\n  └ Dibuat Oleh : ".$UsersData->user_id."\n  └ Pemohon : ".${'Data_'.$permohonanGroup[$k]}[$j]->pemohon_nama."\n  └ Tgl Permohonan : ".${'Data_'.$permohonanGroup[$k]}[$j]->created_at."\n\n# _*Status => Dalam Proses*_ \n  └ Pejabat Desa : Terverifikasi"."\n  └ Operator Kecamatan : Terverifikasi"."\n  └ Operator Capil : Menunggu Verifikasi"."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                                $this->sendwa($sendwamsg_operatorKec,$operatorKec_kontak[$i]['user_hp']);
                                            endif;
                                        endfor;
                                    endfor;
                                endif;
                            endif;
                        endfor;
                        $output_success[]   = 'Info: Berhasil melakukan verifikasi...';
                    } catch(\Illuminate\Database\QueryException $ex){
                        $output_error[] = 'Info: Harap refresh browser (N-05)';
                    }
                else:
                    $permohonanGroup= substr($permohonanID,0,5);

                    $QFindDataDB    = false;
                    if($permohonanGroup=='AKL01'):       $QFindDataDB=Kelahiran1Model::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='AKL02'):   $QFindDataDB=Kelahiran2Model::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='AKM01'):   $QFindDataDB=KematianModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='AKW01'):   $QFindDataDB=PerkawinanModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='AKC01'):   $QFindDataDB=PerceraianModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='PKD01'):   $QFindDataDB=KedatanganModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KIA01'):   $QFindDataDB=KIAModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KKC01'):   $QFindDataDB=KKCetakUlangModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KKN01'):   $QFindDataDB=KKNumpangModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KKU01'):   $QFindDataDB=KKPerubahhanBiodataModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KKP01'):   $QFindDataDB=KKPisahKKModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KKT01'):   $QFindDataDB=KKTambahAnakModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KSL01'):   $QFindDataDB=KonsolidasiUpdateDataModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='KTP01'):   $QFindDataDB=KTPELModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    elseif($permohonanGroup=='PPD01'):   $QFindDataDB=PindahModel::where([['nomorPermohonan',$permohonanID]])->get()->first();
                    endif;

                    $permohonanKet    = false;
                    if($permohonanGroup=='AKL01'):       $permohonanKet='Akta Kelahiran (Blm Ada NIK)';
                    elseif($permohonanGroup=='AKL02'):   $permohonanKet='Akta Kelahiran (Ada NIK)';
                    elseif($permohonanGroup=='AKM01'):   $permohonanKet='Akta Kematian';
                    elseif($permohonanGroup=='AKW01'):   $permohonanKet='Akta Perkawinan';
                    elseif($permohonanGroup=='AKC01'):   $permohonanKet='Akta Perceraian';
                    elseif($permohonanGroup=='PKD01'):   $permohonanKet='Kedatangan Penduduk';
                    elseif($permohonanGroup=='KIA01'):   $permohonanKet='Kartu Identitas Anak (KIA)';
                    elseif($permohonanGroup=='KKC01'):   $permohonanKet='Cetak Ulang KK';
                    elseif($permohonanGroup=='KKN01'):   $permohonanKet='KK Numpang';
                    elseif($permohonanGroup=='KKU01'):   $permohonanKet='Perubahan Biodata KK';
                    elseif($permohonanGroup=='KKP01'):   $permohonanKet='Pisah KK';
                    elseif($permohonanGroup=='KKT01'):   $permohonanKet='KK Tambah Anak';
                    elseif($permohonanGroup=='KSL01'):   $permohonanKet='Konsolidasi Update Data';
                    elseif($permohonanGroup=='KTP01'):   $permohonanKet='KTP-El';
                    elseif($permohonanGroup=='PPD01'):   $permohonanKet='Perpindahan Penduduk';
                    endif;

                    if($QFindDataDB):
                        if($QFindDataDB->progress_status=='2' && $QFindDataDB->verified_pejabatDesa_status=='2'):
                            try {
                                $data = $QFindDataDB;
                                $data->verified_pejabatDesa_status    = '1';
                                $data->verified_pejabatDesa_by        = $sessid;
                                $data->verified_pejabatDesa_date      = Carbon::now();
                                $data->verified_operatorKec_status    = '1';
                                $data->verified_operatorKec_by        = $sessid;
                                $data->verified_operatorKec_date      = Carbon::now();
                                $updVerified = $data->save();

                                if($updVerified):
                                    $UsersData = UsersModel::find($data->created_by);
                                    $sendwamsg_pemohon  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan Disdukcapil\n\n# _*Ringkasan => ".$data->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet."\n  └ Dibuat Oleh : ".$UsersData->user_id."\n  └ Pemohon : ".$data->pemohon_nama."\n  └ Tgl Permohonan : ".$data->created_at."\n\n# _*Status => Dalam Proses*_ \n  └ Pejabat Desa : ".(($data->verified_pejabatDesa_status=='1')?'Terverifikasi':'Menunggu Verifikasi')."\n  └ Operator Kecamatan : ".(($data->verified_pejabatDesa_status=='1' && $data->verified_operatorKec_status=='2')?'Menunggu Verifikasi':(($data->verified_operatorKec_status=='1')?'Terverifikasi':'-'))."\n  └ Operator Capil : ".(($data->verified_operatorKec_status=='1' && $data->verified_operatorCapil_status=='2')?'Menunggu Verifikasi':(($data->verified_operatorCapil_status=='1')?'Terverifikasi':'-'))."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                    $this->sendwa($sendwamsg_pemohon,$data->pemohon_hp);
                        
                                    if($data->pemohon_hp!=$UsersData->user_hp):
                                        $sendwamsg_operator  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan Disdukcapil\n\n# _*Ringkasan => ".$data->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet."\n  └ Dibuat Oleh : ".$UsersData->user_id."\n  └ Pemohon : ".$data->pemohon_nama."\n  └ Tgl Permohonan : ".$data->created_at."\n\n# _*Status => Dalam Proses*_ \n  └ Pejabat Desa : ".(($data->verified_pejabatDesa_status=='1')?'Terverifikasi':'Menunggu Verifikasi')."\n  └ Operator Kecamatan : ".(($data->verified_pejabatDesa_status=='1' && $data->verified_operatorKec_status=='2')?'Menunggu Verifikasi':(($data->verified_operatorKec_status=='1')?'Terverifikasi':'-'))."\n  └ Operator Capil : ".(($data->verified_operatorKec_status=='1' && $data->verified_operatorCapil_status=='2')?'Menunggu Verifikasi':(($data->verified_operatorCapil_status=='1')?'Terverifikasi':'-'))."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                        $this->sendwa($sendwamsg_operator,$UsersData->user_hp);
                                    endif;

                                    for ($i=0; $i<count($operatorKec_kontak); $i++):
                                        if($data->pemohon_hp!=$operatorKec_kontak[$i]['user_hp']): 
                                            $sendwamsg_operator  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan Disdukcapil\n\n# _*Ringkasan => ".$data->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet."\n  └ Dibuat Oleh : ".$UsersData->user_id."\n  └ Pemohon : ".$data->pemohon_nama."\n  └ Tgl Permohonan : ".$data->created_at."\n\n# _*Status => Dalam Proses*_ \n  └ Pejabat Desa : ".(($data->verified_pejabatDesa_status=='1')?'Terverifikasi':'Menunggu Verifikasi')."\n  └ Operator Kecamatan : ".(($data->verified_pejabatDesa_status=='1' && $data->verified_operatorKec_status=='2')?'Menunggu Verifikasi':(($data->verified_operatorKec_status=='1')?'Terverifikasi':'-'))."\n  └ Operator Capil : ".(($data->verified_operatorKec_status=='1' && $data->verified_operatorCapil_status=='2')?'Menunggu Verifikasi':(($data->verified_operatorCapil_status=='1')?'Terverifikasi':'-'))."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                            $this->sendwa($sendwamsg_operator,$operatorKec_kontak[$i]['user_hp']);
                                        endif;
                                    endfor;

                                    $output_success[]   = 'Info: Berhasil melakukan verifikasi...';
                                else:
                                    $output_error[] = 'Info: Data tidak berhasil diperbaharui (N-06)';
                                endif;
                            } catch(\Illuminate\Database\QueryException $ex){
                                $output_error[] = 'Info: Harap refresh browser (N-05)';
                            }
                        else:
                            $output_error[] = 'Info: Harap refresh browser (N-04)';
                        endif;
                    else:
                        $output_error[] = 'Info: Harap refresh browser (N-03)';
                    endif;
                endif;
            else:
                $output_error[] = 'Info: Harap refresh browser (N-02)';
            endif;
        else:
            $output_error[] = 'Info: Harap refresh browser (N-01)';
        endif;

        $output = array('error' => $output_error,'success' => $output_success,'data' => $output_data,'html' => $output_html);
            echo json_encode($output);
    }

    public function sendwa($msg,$hp) {
        $curl   = curl_init();
        $token  = "G1wfTLSJYCQNAROAU3IZJzD5tfYPPiPAI3vuwXsf2ktIo0omz2qG1Wyfa7wcVNJo.HCKKUQTq";
        $data   = [
            'phone'     => $hp,
            'message'   => $msg,
            'secret'    => true,
            'priority'  => true,
        ];

        curl_setopt($curl, CURLOPT_HTTPHEADER,
            array(
                "Authorization: $token",
            )
        );

        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($curl, CURLOPT_URL, "https://solo.wablas.com/api/send-message");
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        $result = curl_exec($curl);
        curl_close($curl);
    }
}