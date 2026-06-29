<?php

namespace App\Http\Controllers\Fronts\Permohonans;

use Validator;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Includes\OptionModel;
use App\Models\Includes\MenuModel;
use DataTables;

use DB;
use App\Quotation;
use Auth;


class RiwayatController extends Controller
{   
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $urlRoute   = $request->get('id');
        $title      = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_id);
        $szcu       = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_width_child1);

        return view('fronts.permohonans.riwayat', ['id'=>$urlRoute,'title'=>$title,'szcu'=>$szcu]);
    }

    public function dalamprosesgetdata(Request $request)
    {   
        $urlRoute   = $request->get('id');
        // $title  = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_id);
        // $szcu   = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_width_child1);

        $auth   = Auth::user();
        $sessnik= $auth->user_nik;
        $sesskk = $auth->user_nokk;

        $query  = Datatables::of(  
            DB::query()
            ->selectRaw('y1.nomorPermohonan,y1.jenisPermohonan,y1.pemohonnik,y1.pemohonkk,y1.statusPermohonan,y1.cat')
            ->fromSub(
                DB::table('t_kelahiran_1 as x1')
                ->selectRaw('
                    x1.nomorPermohonan
                    , \'Akta Kelahiran (Tidak Ada NIK)\' as jenisPermohonan
                    , x1.created_by as pemohonnik
                    , x1.biodata_Kk as pemohonkk
                    , case
                        when x1.progress_status=0 then \'Reject\'
                        when x1.progress_status=1 then \'Accept\'
                        when x1.progress_status=2 then \'New\'
                        when x1.progress_status=3 then \'Progress\'
                        when x1.progress_status=8 then \'Cancel\'
                        when x1.progress_status=9 then \'Close\'
                    end as statusPermohonan
                    , x1.created_at as cat
                ')
                ->where([
                    ['status','=','1']
                    , ['progress_status','=','2']
                    , ['created_by','=',$sessnik]
                ])
                ->unionAll(
                    DB::table('t_kelahiran_2 as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'Reject\'
                                when x1.progress_status=1 then \'Accept\'
                                when x1.progress_status=2 then \'New\'
                                when x1.progress_status=3 then \'Progress\'
                                when x1.progress_status=8 then \'Cancel\'
                                when x1.progress_status=9 then \'Close\'
                            end as statusPermohonan
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','2']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kematian as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kematian\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'Reject\'
                                when x1.progress_status=1 then \'Accept\'
                                when x1.progress_status=2 then \'New\'
                                when x1.progress_status=3 then \'Progress\'
                                when x1.progress_status=8 then \'Cancel\'
                                when x1.progress_status=9 then \'Close\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','2']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kk as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Perubahan Kartu Keluarga\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'Reject\'
                                when x1.progress_status=1 then \'Accept\'
                                when x1.progress_status=2 then \'New\'
                                when x1.progress_status=3 then \'Progress\'
                                when x1.progress_status=8 then \'Cancel\'
                                when x1.progress_status=9 then \'Close\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','2']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kia as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kartu Identitas Anak\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'Reject\'
                                when x1.progress_status=1 then \'Accept\'
                                when x1.progress_status=2 then \'New\'
                                when x1.progress_status=3 then \'Progress\'
                                when x1.progress_status=8 then \'Cancel\'
                                when x1.progress_status=9 then \'Close\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','2']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_pindah as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Pindah\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'Reject\'
                                when x1.progress_status=1 then \'Accept\'
                                when x1.progress_status=2 then \'New\'
                                when x1.progress_status=3 then \'Progress\'
                                when x1.progress_status=8 then \'Cancel\'
                                when x1.progress_status=9 then \'Close\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','2']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kedatangan as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kedatangan\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'Reject\'
                                when x1.progress_status=1 then \'Accept\'
                                when x1.progress_status=2 then \'New\'
                                when x1.progress_status=3 then \'Progress\'
                                when x1.progress_status=8 then \'Cancel\'
                                when x1.progress_status=9 then \'Close\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','2'] 
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_pencetakanktp as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , case
                                when x1.pencetakanKTP_group=\'baru\' then \'Pencetakan KTP (Baru)\'
                                when x1.pencetakanKTP_group=\'hilang\' then \'Pencetakan KTP (Hilang)\'
                                when x1.pencetakanKTP_group=\'rusak\' then \'Pencetakan KTP (Rusak)\'
                                when x1.pencetakanKTP_group=\'gantidata\' then \'Pencetakan KTP (Ganti Data)\'
                            end as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'Reject\'
                                when x1.progress_status=1 then \'Accept\'
                                when x1.progress_status=2 then \'New\'
                                when x1.progress_status=3 then \'Progress\'
                                when x1.progress_status=8 then \'Cancel\'
                                when x1.progress_status=9 then \'Close\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','2']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ,'y1'
            )
        )
        ->addColumn(
            'statusPermohonan', '<span class="badge badge-warning" style="font-size: 0.5rem; border-radius: 7px !important;">{{$statusPermohonan}}</span>'
        )
        ->rawColumns(['statusPermohonan'])
        ->toJson();

        return $query;
    }

    public function selesaigetdata(Request $request)
    {   
        $urlRoute   = $request->get('id');
        // $title  = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_id);
        // $szcu   = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_width_child1);

        $auth   = Auth::user();
        $sessnik= $auth->user_nik;
        $sesskk = $auth->user_nokk;

        $query  = Datatables::of(  
            DB::query()
            ->selectRaw('y1.nomorPermohonan,y1.jenisPermohonan,y1.pemohonnik,y1.pemohonkk,y1.statusPermohonan,y1.cat')
            ->fromSub(
                DB::table('t_kelahiran_1 as x1')
                ->selectRaw('
                    x1.nomorPermohonan
                    , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                    , x1.created_by as pemohonnik
                    , x1.biodata_Kk as pemohonkk
                    , case
                        when x1.progress_status=0 then \'DiTolak\'
                        when x1.progress_status=2 then \'Dalam Proses\'
                        when x1.progress_status=8 then \'Diterima\'
                        when x1.progress_status=9 then \'Dibatalkan\'
                    end as statusPermohonan
                    , x1.created_at as cat
                ')
                ->where([
                    ['status','=','1']
                    , ['progress_status','=','9']
                    , ['created_by','=',$sessnik]
                ])
                ->unionAll(
                    DB::table('t_kelahiran_2 as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as statusPermohonan
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','9']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kematian as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kematian\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','9']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kk as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Perubahan Kartu Keluarga\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','9']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kia as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kartu Identitas Anak\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','9']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kia as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Pindah\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','9']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kia as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kedatangan\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','9']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_pencetakanktp as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , case
                                when x1.pencetakanKTP_group=\'baru\' then \'Pencetakan KTP (Baru)\'
                                when x1.pencetakanKTP_group=\'hilang\' then \'Pencetakan KTP (Hilang)\'
                                when x1.pencetakanKTP_group=\'rusak\' then \'Pencetakan KTP (Rusak)\'
                                when x1.pencetakanKTP_group=\'gantidata\' then \'Pencetakan KTP (Ganti Data)\'
                            end as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','9']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ,'y1'
            )
        )
        ->addColumn(
            'statusPermohonan', '<span class="badge badge-warning" style="font-size: 0.5rem; border-radius: 7px !important;">{{$statusPermohonan}}</span>'
        )
        ->rawColumns(['statusPermohonan'])
        ->toJson();

        return $query;
    }

    public function ditolakgetdata(Request $request)
    {   
        $urlRoute   = $request->get('id');
        // $title  = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_id);
        // $szcu   = str_replace('_',' ',MenuModel::where([['menu_link','=','/'.$urlRoute]])->first()->menu_width_child1);

        $auth   = Auth::user();
        $sessnik= $auth->user_nik;
        $sesskk = $auth->user_nokk;

        $query  = Datatables::of(  
            DB::query()
            ->selectRaw('y1.nomorPermohonan,y1.jenisPermohonan,y1.pemohonnik,y1.pemohonkk,y1.statusPermohonan,y1.cat')
            ->fromSub(
                DB::table('t_kelahiran_1 as x1')
                ->selectRaw('
                    x1.nomorPermohonan
                    , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                    , x1.created_by as pemohonnik
                    , x1.biodata_Kk as pemohonkk
                    , case
                        when x1.progress_status=0 then \'DiTolak\'
                        when x1.progress_status=2 then \'Dalam Proses\'
                        when x1.progress_status=8 then \'Diterima\'
                        when x1.progress_status=9 then \'Dibatalkan\'
                    end as statusPermohonan
                    , x1.created_at as cat
                ')
                ->where([
                    ['status','=','1']
                    , ['progress_status','=','0']
                    , ['created_by','=',$sessnik]
                ])
                ->unionAll(
                    DB::table('t_kelahiran_2 as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Akta Kelahiran (Ada NIK)\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as statusPermohonan
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','0']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kematian as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kematian\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','0']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kk as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Perubahan Kartu Keluarga\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','0']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kia as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kartu Identitas Anak\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','0']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_pindah as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Pindah\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','0']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_kedatangan as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , \'Kedatangan\' as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','0']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ->unionAll(
                    DB::table('t_pencetakanktp as x1')
                        ->selectRaw('
                            x1.nomorPermohonan
                            , case
                                when x1.pencetakanKTP_group=\'baru\' then \'Pencetakan KTP (Baru)\'
                                when x1.pencetakanKTP_group=\'hilang\' then \'Pencetakan KTP (Hilang)\'
                                when x1.pencetakanKTP_group=\'rusak\' then \'Pencetakan KTP (Rusak)\'
                                when x1.pencetakanKTP_group=\'gantidata\' then \'Pencetakan KTP (Ganti Data)\'
                            end as jenisPermohonan
                            , x1.created_by as pemohonnik
                            , x1.biodata_Kk as pemohonkk
                            , case
                                when x1.progress_status=0 then \'DiTolak\'
                                when x1.progress_status=2 then \'Dalam Proses\'
                                when x1.progress_status=8 then \'Diterima\'
                                when x1.progress_status=9 then \'Dibatalkan\'
                            end as status
                            , x1.created_at as cat
                        ')
                        ->where([
                            ['status','=','1']
                            , ['progress_status','=','0']
                            , ['created_by','=',$sessnik]
                        ])
                )
                ,'y1'
            )
        )
        ->addColumn(
            'statusPermohonan', '<span class="badge badge-warning" style="font-size: 0.5rem; border-radius: 7px !important;">{{$statusPermohonan}}</span>'
        )
        ->rawColumns(['statusPermohonan'])
        ->toJson();

        return $query;
    }

    function fetchDatas(Request $request)
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
}